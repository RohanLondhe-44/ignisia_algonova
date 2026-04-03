import cv2
import mediapipe as mp
import numpy as np
import json
import math
import time
import argparse
import collections
from dataclasses import dataclass, field
from typing import Optional

LATEST_METRICS = {}
#default values
DEFAULT_CONFIG = {
    "camera_index":       0,
    "min_depth_thresh":   0.04,
    "max_depth_thresh":   0.08,
    "cpm_low":            100,
    "cpm_high":           120,
    "elbow_angle_thresh": 160,
    "chest_x_tolerance":  0.12,
    "chest_y_band":       [0.35, 0.55]
}

C_GREEN  = (0, 230, 120)
C_RED    = (50,  50, 255)
C_YELLOW = (0, 210, 255)
C_CYAN   = (220, 200, 0)
C_WHITE  = (230, 230, 230)
C_DIM    = (80,  90, 100)
C_BG     = (10,  13,  18)

def angle_between(a, b, c) -> float:
    """Angle at point b formed by a-b-c (all (x,y) tuples). Returns degrees."""
    ba = (a[0]-b[0], a[1]-b[1])
    bc = (c[0]-b[0], c[1]-b[1])
    dot = ba[0]*bc[0] + ba[1]*bc[1]
    mag = math.sqrt(ba[0]**2+ba[1]**2) * math.sqrt(bc[0]**2+bc[1]**2)
    if mag == 0:
        return 0.0
    return math.degrees(math.acos(max(-1, min(1, dot/mag))))


def lm(pose_lm, idx, w, h):
    """Return pixel (x,y) and visibility for a landmark index."""
    p = pose_lm[idx]
    return (int(p.x * w), int(p.y * h)), p.visibility


def norm_lm(pose_lm, idx):
    """Return normalised (x,y) for a landmark index."""
    p = pose_lm[idx]
    return p.x, p.y


def status_color(ok: Optional[bool]):
    if ok is None:   return C_DIM
    return C_GREEN if ok else C_RED


def put_metric(img, label, value, unit, color, x, y, ok=None):
    """Draw one metric block at (x,y)."""
    dot_color = C_GREEN if ok else (C_RED if ok is False else C_DIM)
    cv2.circle(img, (x+6, y+6), 5, dot_color, -1)
    cv2.putText(img, label, (x+18, y+9),
                cv2.FONT_HERSHEY_SIMPLEX, 0.36, C_DIM, 1, cv2.LINE_AA)
    cv2.putText(img, value, (x+18, y+32),
                cv2.FONT_HERSHEY_SIMPLEX, 0.9, color, 2, cv2.LINE_AA)
    if unit:
        tw, _ = cv2.getTextSize(value, cv2.FONT_HERSHEY_SIMPLEX, 0.9, 2)[0], 0
        cv2.putText(img, unit, (x+18+tw[0]+4, y+32),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.38, C_DIM, 1, cv2.LINE_AA)


@dataclass
class CPRState:
    
    wrist_y_history:  collections.deque = field(default_factory=lambda: collections.deque(maxlen=120))
    compress_times:   collections.deque = field(default_factory=lambda: collections.deque(maxlen=30))
    in_compress:      bool  = False
    peak_y:           float = 0.0
    trough_y:         float = 0.0
    last_peak_y:      float = 0.0

    
    cpm:              float = 0.0
    depth_norm:       float = 0.0  
    depth_ok:         Optional[bool] = None
    center_ok:        Optional[bool] = None
    elbow_ok:         Optional[bool] = None
    both_hands_ok:    Optional[bool] = None
    cpm_ok:           Optional[bool] = None


def main(config: dict):
    mp_pose = mp.solutions.pose
    pose    = mp_pose.Pose(
        static_image_mode=False,
        model_complexity=1,
        smooth_landmarks=True,
        min_detection_confidence=0.6,
        min_tracking_confidence=0.6
    )

    cap = cv2.VideoCapture(config["camera_index"])
    cap.set(cv2.CAP_PROP_FRAME_WIDTH,  1280)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)

    state  = CPRState()
    prev_t = time.time()

    
    SIDE_W = 300

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        frame = cv2.flip(frame, 1)
        h, w  = frame.shape[:2]
        rgb   = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        res   = pose.process(rgb)

        
        sidebar = np.full((h, SIDE_W, 3), C_BG, dtype=np.uint8)

        if res.pose_landmarks:
            lms = res.pose_landmarks.landmark

            # Landmark indices 
            # 11 = L_shoulder 12 = R_shoulder
            # 13 = L_elbow    14 = R_elbow
            # 15 = L_wrist    16 = R_wrist
            # 23 = L_hip      24 = R_hip

            vis_thresh = 0.5

            def visible(idx): return lms[idx].visibility > vis_thresh

            L_vis = visible(15) and visible(13) and visible(11)
            R_vis = visible(16) and visible(14) and visible(12)
            state.both_hands_ok = L_vis and R_vis

            
            if L_vis and R_vis:
                lw_x, lw_y = norm_lm(lms, 15)
                rw_x, rw_y = norm_lm(lms, 16)
                mid_x = (lw_x + rw_x) / 2
                mid_y = (lw_y + rw_y) / 2
            elif L_vis:
                mid_x, mid_y = norm_lm(lms, 15)
            elif R_vis:
                mid_x, mid_y = norm_lm(lms, 16)
            else:
                mid_x, mid_y = 0.5, 0.45

      
            state.wrist_y_history.append(mid_y)

            if len(state.wrist_y_history) > 5:
                smooth_y = np.mean(list(state.wrist_y_history)[-5:])

              
                if not state.in_compress:
                    if smooth_y > state.peak_y + config["min_depth_thresh"]:
                        state.in_compress = True
                        state.trough_y    = smooth_y
                else:
                    if smooth_y > state.trough_y:
                        state.trough_y = smooth_y
                    if smooth_y < state.trough_y - config["min_depth_thresh"] * 0.5:
                       
                        depth = state.trough_y - state.peak_y
                        state.depth_norm = depth
                        state.compress_times.append(time.time())
                        state.in_compress = False
                        state.peak_y      = smooth_y

                if not state.in_compress:
                    state.peak_y = min(state.peak_y, smooth_y) if state.wrist_y_history else smooth_y

           
            d = state.depth_norm
            if d < config["min_depth_thresh"]:
                state.depth_ok = False   
            elif d > config["max_depth_thresh"]:
                state.depth_ok = False
            else:
                state.depth_ok = True

           ## CPM (buggy as of now)
            now = time.time()
            
            while state.compress_times and now - state.compress_times[0] > 10:
                state.compress_times.popleft()
            if len(state.compress_times) >= 2:
                span = state.compress_times[-1] - state.compress_times[0]
                if span > 0:
                    state.cpm = (len(state.compress_times)-1) / span * 60
            state.cpm_ok = config["cpm_low"] <= state.cpm <= config["cpm_high"]

            
            ls_x, ls_y = norm_lm(lms, 11)
            rs_x, rs_y = norm_lm(lms, 12)
            chest_cx   = (ls_x + rs_x) / 2
            chest_cy   = (ls_y + rs_y) / 2 + 0.1  

            x_ok = abs(mid_x - chest_cx) < config["chest_x_tolerance"]
            yb   = config["chest_y_band"]
            y_ok = yb[0] < mid_y < yb[1]
            state.center_ok = x_ok and y_ok

            
            elbow_ok_L = elbow_ok_R = None
            if L_vis:
                sh = norm_lm(lms, 11)
                el = norm_lm(lms, 13)
                wr = norm_lm(lms, 15)
                ang = angle_between(sh, el, wr)
                elbow_ok_L = ang >= config["elbow_angle_thresh"]
            if R_vis:
                sh = norm_lm(lms, 12)
                el = norm_lm(lms, 14)
                wr = norm_lm(lms, 16)
                ang = angle_between(sh, el, wr)
                elbow_ok_R = ang >= config["elbow_angle_thresh"]

            if elbow_ok_L is not None and elbow_ok_R is not None:
                state.elbow_ok = elbow_ok_L and elbow_ok_R
            elif elbow_ok_L is not None:
                state.elbow_ok = elbow_ok_L
            elif elbow_ok_R is not None:
                state.elbow_ok = elbow_ok_R

            # skeleton on playback
            mp.solutions.drawing_utils.draw_landmarks(
                frame,
                res.pose_landmarks,
                mp_pose.POSE_CONNECTIONS,
                mp.solutions.drawing_utils.DrawingSpec(color=(40,60,80),  thickness=2, circle_radius=2),
                mp.solutions.drawing_utils.DrawingSpec(color=(80,140,200),thickness=2, circle_radius=2),
            )

            
            for idx, vis in [(15, L_vis), (16, R_vis)]:
                if vis:
                    pt, _ = lm(lms, idx, w, h)
                    cv2.circle(frame, pt, 10, C_CYAN, 2)

            
            tx = int(chest_cx * w)
            ty = int(((ls_y+rs_y)/2 + 0.15) * h)
            col = C_GREEN if state.center_ok else C_RED
            cv2.line(frame, (tx-18, ty), (tx+18, ty), col, 2)
            cv2.line(frame, (tx, ty-18), (tx, ty+18), col, 2)
            cv2.circle(frame, (tx, ty), 22, col, 1)
            cv2.putText(frame, "TARGET", (tx+26, ty+5),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.38, col, 1, cv2.LINE_AA)

        
        cv2.putText(sidebar, "CPR MONITOR", (12, 30),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, C_CYAN, 2, cv2.LINE_AA)
        cv2.line(sidebar, (12, 40), (SIDE_W-12, 40), (30,40,50), 1)

        metrics = [
            ("CPM",         f"{state.cpm:.0f}",    "bpm", state.cpm_ok),
            ("DEPTH",       f"{state.depth_norm*100:.1f}", "cm~", state.depth_ok),
            ("CENTERING",   "OK" if state.center_ok else "OFF", "", state.center_ok),
            ("ELBOW LOCK",  "LOCKED" if state.elbow_ok else "BENT", "", state.elbow_ok),
            ("BOTH HANDS",  "YES" if state.both_hands_ok else "NO",  "", state.both_hands_ok),
        ]

        y0 = 60
        for label, val, unit, ok in metrics:
            col = status_color(ok)
            put_metric(sidebar, label, val, unit, col, 12, y0, ok)
            cv2.line(sidebar, (12, y0+46), (SIDE_W-12, y0+46), (20,28,38), 1)
            y0 += 58

        
        all_ok = all(
            v is not None and v
            for v in [state.cpm_ok, state.depth_ok,
                      state.center_ok, state.elbow_ok, state.both_hands_ok]
        )
        bar_col = C_GREEN if all_ok else C_RED
        bar_txt = "GOOD CPR" if all_ok else "CHECK FORM"
        cv2.rectangle(sidebar, (12, h-56), (SIDE_W-12, h-12), bar_col, -1)
        tw = cv2.getTextSize(bar_txt, cv2.FONT_HERSHEY_SIMPLEX, 0.65, 2)[0][0]
        cv2.putText(sidebar, bar_txt,
                    ((SIDE_W - tw)//2, h-26),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.65,
                    C_BG, 2, cv2.LINE_AA)

        # calc fps
        now  = time.time()
        fps  = 1.0 / (now - prev_t + 1e-9)
        prev_t = now
        cv2.putText(sidebar, f"{fps:.0f} fps", (12, h-68),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.32, C_DIM, 1, cv2.LINE_AA)

        
        combined = np.hstack([frame, sidebar])
        cv2.imshow("CPR Tracker  |  q to quit", combined)

        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()
    pose.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="CPR Tracker")
    parser.add_argument("--config", type=str, default=None,
                        help="Path to JSON config file")
    args = parser.parse_args()

    cfg = DEFAULT_CONFIG.copy()
    if args.config:
        with open(args.config) as f:
            overrides = json.load(f)
        cfg.update(overrides)


    print(json.dumps(cfg, indent=4))
    
    print("  Press Q in the video window to quit.")
 
    main(cfg)


def generate_frames(config):
    mp_pose = mp.solutions.pose
    pose = mp_pose.Pose(
        static_image_mode=False,
        model_complexity=1,
        smooth_landmarks=True,
        min_detection_confidence=0.6,
        min_tracking_confidence=0.6
    )

    cap = cv2.VideoCapture(config["camera_index"])
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)

    state = CPRState()
    prev_t = time.time()
    SIDE_W = 300

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        frame = cv2.flip(frame, 1)
        h, w = frame.shape[:2]
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        res = pose.process(rgb)

        sidebar = np.full((h, SIDE_W, 3), C_BG, dtype=np.uint8)

        if res.pose_landmarks:
            lms = res.pose_landmarks.landmark

            vis_thresh = 0.5
            def visible(idx): return lms[idx].visibility > vis_thresh

            L_vis = visible(15) and visible(13) and visible(11)
            R_vis = visible(16) and visible(14) and visible(12)
            state.both_hands_ok = L_vis and R_vis

            if L_vis and R_vis:
                lw_x, lw_y = norm_lm(lms, 15)
                rw_x, rw_y = norm_lm(lms, 16)
                mid_x = (lw_x + rw_x) / 2
                mid_y = (lw_y + rw_y) / 2
            elif L_vis:
                mid_x, mid_y = norm_lm(lms, 15)
            elif R_vis:
                mid_x, mid_y = norm_lm(lms, 16)
            else:
                mid_x, mid_y = 0.5, 0.45

            state.wrist_y_history.append(mid_y)

            if len(state.wrist_y_history) > 5:
                smooth_y = np.mean(list(state.wrist_y_history)[-5:])

                if not state.in_compress:
                    if smooth_y > state.peak_y + config["min_depth_thresh"]:
                        state.in_compress = True
                        state.trough_y = smooth_y
                else:
                    if smooth_y > state.trough_y:
                        state.trough_y = smooth_y
                    if smooth_y < state.trough_y - config["min_depth_thresh"] * 0.5:
                        depth = state.trough_y - state.peak_y
                        state.depth_norm = depth
                        state.compress_times.append(time.time())
                        state.in_compress = False
                        state.peak_y = smooth_y

                if not state.in_compress:
                    state.peak_y = min(state.peak_y, smooth_y) if state.wrist_y_history else smooth_y

            d = state.depth_norm
            if d < config["min_depth_thresh"]:
                state.depth_ok = False
            elif d > config["max_depth_thresh"]:
                state.depth_ok = False
            else:
                state.depth_ok = True

            now = time.time()
            while state.compress_times and now - state.compress_times[0] > 10:
                state.compress_times.popleft()
            if len(state.compress_times) >= 2:
                span = state.compress_times[-1] - state.compress_times[0]
                if span > 0:
                    state.cpm = (len(state.compress_times) - 1) / span * 60
            state.cpm_ok = config["cpm_low"] <= state.cpm <= config["cpm_high"]

            ls_x, ls_y = norm_lm(lms, 11)
            rs_x, rs_y = norm_lm(lms, 12)
            chest_cx = (ls_x + rs_x) / 2
            chest_cy = (ls_y + rs_y) / 2 + 0.1

            x_ok = abs(mid_x - chest_cx) < config["chest_x_tolerance"]
            yb = config["chest_y_band"]
            y_ok = yb[0] < mid_y < yb[1]
            state.center_ok = x_ok and y_ok

            elbow_ok_L = elbow_ok_R = None
            if L_vis:
                ang = angle_between(norm_lm(lms, 11), norm_lm(lms, 13), norm_lm(lms, 15))
                elbow_ok_L = ang >= config["elbow_angle_thresh"]
            if R_vis:
                ang = angle_between(norm_lm(lms, 12), norm_lm(lms, 14), norm_lm(lms, 16))
                elbow_ok_R = ang >= config["elbow_angle_thresh"]

            if elbow_ok_L is not None and elbow_ok_R is not None:
                state.elbow_ok = elbow_ok_L and elbow_ok_R
            elif elbow_ok_L is not None:
                state.elbow_ok = elbow_ok_L
            elif elbow_ok_R is not None:
                state.elbow_ok = elbow_ok_R

            mp.solutions.drawing_utils.draw_landmarks(
                frame,
                res.pose_landmarks,
                mp_pose.POSE_CONNECTIONS,
                mp.solutions.drawing_utils.DrawingSpec(color=(40,60,80), thickness=2, circle_radius=2),
                mp.solutions.drawing_utils.DrawingSpec(color=(80,140,200), thickness=2, circle_radius=2),
            )

            for idx, vis in [(15, L_vis), (16, R_vis)]:
                if vis:
                    pt, _ = lm(lms, idx, w, h)
                    cv2.circle(frame, pt, 10, C_CYAN, 2)

            tx = int(chest_cx * w)
            ty = int(((ls_y + rs_y) / 2 + 0.15) * h)
            col = C_GREEN if state.center_ok else C_RED
            cv2.line(frame, (tx-18, ty), (tx+18, ty), col, 2)
            cv2.line(frame, (tx, ty-18), (tx, ty+18), col, 2)
            cv2.circle(frame, (tx, ty), 22, col, 1)
            cv2.putText(frame, "TARGET", (tx+26, ty+5),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.38, col, 1, cv2.LINE_AA)

        cv2.putText(sidebar, "CPR MONITOR", (12, 30),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, C_CYAN, 2, cv2.LINE_AA)
        cv2.line(sidebar, (12, 40), (SIDE_W-12, 40), (30,40,50), 1)

        metrics = [
            ("CPM", f"{state.cpm:.0f}", "bpm", state.cpm_ok),
            ("DEPTH", f"{state.depth_norm*100:.1f}", "cm~", state.depth_ok),
            ("CENTERING", "OK" if state.center_ok else "OFF", "", state.center_ok),
            ("ELBOW LOCK", "LOCKED" if state.elbow_ok else "BENT", "", state.elbow_ok),
            ("BOTH HANDS", "YES" if state.both_hands_ok else "NO", "", state.both_hands_ok),
        ]

        y0 = 60
        for label, val, unit, ok in metrics:
            col = status_color(ok)
            put_metric(sidebar, label, val, unit, col, 12, y0, ok)
            cv2.line(sidebar, (12, y0+46), (SIDE_W-12, y0+46), (20,28,38), 1)
            y0 += 58

        all_ok = all(v is not None and v for v in [
            state.cpm_ok, state.depth_ok,
            state.center_ok, state.elbow_ok, state.both_hands_ok
        ])

        bar_col = C_GREEN if all_ok else C_RED
        bar_txt = "GOOD CPR" if all_ok else "CHECK FORM"
        cv2.rectangle(sidebar, (12, h-56), (SIDE_W-12, h-12), bar_col, -1)

        tw = cv2.getTextSize(bar_txt, cv2.FONT_HERSHEY_SIMPLEX, 0.65, 2)[0][0]
        cv2.putText(sidebar, bar_txt,
                    ((SIDE_W - tw)//2, h-26),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.65,
                    C_BG, 2, cv2.LINE_AA)

        now = time.time()
        fps = 1.0 / (now - prev_t + 1e-9)
        prev_t = now
        cv2.putText(sidebar, f"{fps:.0f} fps", (12, h-68),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.32, C_DIM, 1, cv2.LINE_AA)

        combined = np.hstack([frame, sidebar])

        _, buffer = cv2.imencode('.jpg', combined)
        frame_bytes = buffer.tobytes()

        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
        global LATEST_METRICS
        LATEST_METRICS = generate_metrics(state)
    
        
     
def generate_metrics(state):
    return {
        "cpm": round(state.cpm, 2),
        "depth": round(state.depth_norm * 100, 2),
        "depth_ok": state.depth_ok,
        "center_ok": state.center_ok,
        "elbow_ok": state.elbow_ok,
        "hands_ok": state.both_hands_ok,
        "cpm_ok": state.cpm_ok
    }
    cap.release()
    pose.close()