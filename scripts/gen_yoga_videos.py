#!/usr/bin/env python3
"""Generate animated yoga pose placeholder videos using Pillow + imageio[pyav]."""
import os, math, textwrap
import numpy as np
import imageio.v3 as iio
from PIL import Image, ImageDraw, ImageFont

OUT_DIR = os.path.join(os.path.dirname(__file__), '..', 'videos')
os.makedirs(OUT_DIR, exist_ok=True)

W, H = 854, 480
FPS = 8   # lower fps = faster generation & smaller file, still smooth for demonstrations

# Pose data: (filename, korean_name, sanskrit, color_hue, steps)
POSES = [
  ('tadasana.mp4', '산 자세', 'Tadasana', 210, [
    '두 발을 모으거나 엉덩이 너비로 벌리고 섭니다.',
    '발바닥 전체를 고르게 바닥에 붙이고 무게를 균등하게 분산합니다.',
    '허벅지 근육을 위로 끌어올리고 꼬리뼈를 살짝 당깁니다.',
    '가슴을 열고 어깨를 뒤로 당겨 등을 펴세요.',
    '정수리를 하늘 방향으로 길게 뻗으며 5~10회 호흡합니다.',
  ]),
  ('adho-mukha-svanasana.mp4', '하향 개 자세', 'Adho Mukha Svanasana', 160, [
    '네 발 기기 자세에서 시작합니다.',
    '발가락을 구부리고 무릎을 바닥에서 들어 엉덩이를 위로 밀어올립니다.',
    '팔을 곧게 펴고 등을 길게 뻗어 역 V 자 모양을 만듭니다.',
    '뒤꿈치를 바닥 방향으로 누르고 무릎은 살짝 구부려도 됩니다.',
    '5~8회 깊게 호흡하며 자세를 유지합니다.',
  ]),
  ('virabhadrasana-i.mp4', '전사 I', 'Virabhadrasana I', 0, [
    '산 자세에서 시작하여 오른발을 앞으로 크게 내딛습니다.',
    '뒷발은 45° 각도로 바깥쪽으로 돌립니다.',
    '앞 무릎을 90° 굽혀 발목 위에 위치시킵니다.',
    '팔을 위로 들어 올리고 손바닥을 마주보게 합니다.',
    '시선을 앞 또는 위를 향해 5~8회 호흡합니다.',
  ]),
  ('virabhadrasana-ii.mp4', '전사 II', 'Virabhadrasana II', 20, [
    '두 발을 어깨 너비의 2배 정도 벌리고 섭니다.',
    '오른발을 90° 오른쪽으로 돌리고 왼발은 약간 안쪽으로 돌립니다.',
    '오른 무릎을 90° 굽히고 발목 위에 위치시킵니다.',
    '팔을 양쪽으로 평행하게 뻗고 시선은 오른손 방향을 바라봅니다.',
    '어깨를 이완하고 5~8회 호흡합니다.',
  ]),
  ('vrksasana.mp4', '나무 자세', 'Vrksasana', 120, [
    '산 자세에서 시작하여 체중을 왼발로 옮깁니다.',
    '오른발을 들어 올려 발바닥을 왼쪽 허벅지 안쪽에 붙입니다.',
    '두 손을 가슴 앞에서 합장하거나 위로 들어올립니다.',
    '시선을 멀리 고정된 한 점에 집중합니다.',
    '5~10회 호흡 후 발을 바꿔 반대쪽을 반복합니다.',
  ]),
  ('balasana.mp4', '아이 자세', 'Balasana', 240, [
    '무릎을 꿇고 앉은 자세에서 시작합니다.',
    '무릎을 엉덩이 너비로 벌리거나 모읍니다.',
    '상체를 앞으로 숙여 이마를 바닥에 닿게 합니다.',
    '팔을 앞으로 뻗거나 몸 옆으로 놓습니다.',
    '눈을 감고 깊게 호흡하며 충분한 시간 동안 이완합니다.',
  ]),
  ('bhujangasana.mp4', '코브라 자세', 'Bhujangasana', 30, [
    '엎드린 자세에서 손을 어깨 옆 바닥에 놓습니다.',
    '팔꿈치를 몸에 붙이고 발등을 바닥에 밀어 넣습니다.',
    '숨을 들이쉬며 가슴과 머리를 바닥에서 들어올립니다.',
    '팔꿈치를 약간 굽혀 상체만 들어올리고 하복부는 바닥에 붙입니다.',
    '3~5회 호흡 후 천천히 내려옵니다.',
  ]),
  ('setu-bandhasana.mp4', '다리 자세', 'Setu Bandhasana', 45, [
    '등을 대고 누운 자세에서 무릎을 구부려 발바닥을 바닥에 놓습니다.',
    '발은 엉덩이 너비로 벌리고 발꿈치가 무릎 아래에 오도록 합니다.',
    '숨을 들이쉬며 엉덩이를 천천히 들어올립니다.',
    '손을 등 아래로 깍지끼고 어깨를 모읍니다.',
    '5~8회 호흡 후 척추를 위에서부터 하나씩 내려놓습니다.',
  ]),
  ('paschimottanasana.mp4', '앉아서 전굴', 'Paschimottanasana', 180, [
    '다리를 앞으로 펴고 바닥에 앉습니다.',
    '발끝을 몸 쪽으로 당기고 허벅지를 바닥으로 누릅니다.',
    '숨을 들이쉬며 척추를 길게 뻗습니다.',
    '내쉬면서 상체를 앞으로 천천히 기울입니다.',
    '두 손으로 발이나 발목을 잡고 5~10회 깊게 호흡합니다.',
  ]),
  ('ardha-matsyendrasana.mp4', '앉아서 비틀기', 'Ardha Matsyendrasana', 280, [
    '다리를 앞으로 펴고 앉습니다.',
    '오른 무릎을 굽혀 발을 왼쪽 허벅지 바깥쪽 바닥에 놓습니다.',
    '왼팔로 오른 무릎을 감싸 안고 오른손을 뒤쪽 바닥에 댑니다.',
    '숨을 들이쉬며 척추를 세우고 내쉬면서 오른쪽으로 비틉니다.',
    '5~8회 호흡 후 반대쪽을 반복합니다.',
  ]),
  ('trikonasana.mp4', '삼각 자세', 'Trikonasana', 60, [
    '두 발을 어깨 너비 2배로 벌리고 오른발을 90° 오른쪽으로 돌립니다.',
    '팔을 양쪽으로 어깨 높이로 펼칩니다.',
    '숨을 내쉬며 오른쪽으로 몸을 기울여 오른손으로 발목이나 바닥을 짚습니다.',
    '왼팔을 하늘로 뻗고 시선을 왼손 방향으로 향합니다.',
    '5~8회 호흡 후 반대쪽을 반복합니다.',
  ]),
  ('garudasana.mp4', '독수리 자세', 'Garudasana', 200, [
    '산 자세에서 시작하여 무릎을 약간 굽힙니다.',
    '오른 다리를 들어 왼 다리에 감아 발끝을 왼 종아리 뒤에 걸칩니다.',
    '두 팔을 앞으로 뻗어 오른팔을 왼팔 위로 감아 손바닥을 마주보게 합니다.',
    '팔을 얼굴 높이로 들어올리고 무릎을 조금 더 굽힙니다.',
    '5~8회 호흡 후 반대쪽을 반복합니다.',
  ]),
  ('dhanurasana.mp4', '활 자세', 'Dhanurasana', 10, [
    '엎드린 자세에서 이마를 바닥에 대고 시작합니다.',
    '무릎을 굽혀 발목을 손으로 잡습니다.',
    '숨을 들이쉬며 발을 차면서 상체와 하체를 동시에 들어올립니다.',
    '몸이 활 모양이 되도록 가슴과 넓적다리를 바닥에서 최대한 올립니다.',
    '3~5회 호흡 후 천천히 내려와 아이 자세로 휴식합니다.',
  ]),
  ('ardha-chandrasana.mp4', '반달 자세', 'Ardha Chandrasana', 50, [
    '전사 II 자세에서 시작하여 앞쪽 무릎 위로 상체를 기울입니다.',
    '앞쪽 손을 발 앞 바닥에 놓고 체중을 앞발로 옮깁니다.',
    '뒷발을 들어 올려 바닥과 평행이 되도록 뻗습니다.',
    '위쪽 팔을 하늘로 뻗고 가슴을 옆으로 열어 상체를 회전합니다.',
    '시선은 위 손 방향으로 향하며 5~8회 호흡합니다.',
  ]),
  ('dolphin-pose.mp4', '물구나무서기 준비', 'Dolphin Pose', 190, [
    '전완을 바닥에 대고 엎드립니다 (팔꿈치는 어깨 아래).',
    '발가락을 구부리고 무릎을 들어 돌고래 자세를 취합니다.',
    '엉덩이를 최대한 위로 올려 역 V 자를 만듭니다.',
    '어깨를 귀에서 멀리 밀어내리고 코어를 수축합니다.',
    '5~10회 호흡 후 아이 자세로 휴식합니다.',
  ]),
  ('savasana.mp4', '사체 자세', 'Savasana', 220, [
    '등을 대고 편안하게 눕습니다.',
    '발을 자연스럽게 벌리고 손은 손바닥이 위를 향하게 옆에 놓습니다.',
    '눈을 감고 전신의 힘을 완전히 뺍니다.',
    '자연스러운 호흡을 유지하며 몸의 감각에 집중합니다.',
    '5~15분 동안 충분히 이완합니다.',
  ]),
]

def hsl_to_rgb(h, s, l):
    h /= 360; s /= 100; l /= 100
    if s == 0:
        return (int(l*255),) * 3
    def hue2rgb(p, q, t):
        if t < 0: t += 1
        if t > 1: t -= 1
        if t < 1/6: return p + (q-p)*6*t
        if t < 1/2: return q
        if t < 2/3: return p + (q-p)*(2/3-t)*6
        return p
    q = l*(1+s) if l < 0.5 else l+s-l*s
    p = 2*l-q
    return (int(hue2rgb(p,q,h+1/3)*255),
            int(hue2rgb(p,q,h)*255),
            int(hue2rgb(p,q,h-1/3)*255))

def load_font(size):
    for path in [
        '/usr/share/fonts/truetype/noto/NotoSansCJK-Regular.ttc',
        '/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc',
        '/usr/share/fonts/truetype/noto/NotoSans-Regular.ttf',
        '/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf',
        '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
    ]:
        if os.path.exists(path):
            try:
                return ImageFont.truetype(path, size)
            except Exception:
                pass
    return ImageFont.load_default()

def draw_text_wrapped(draw, text, x, y, font, fill, max_width, line_height):
    words = text.split()
    lines = []
    current = ''
    for w in words:
        test = (current + ' ' + w).strip()
        bbox = draw.textbbox((0,0), test, font=font)
        if bbox[2] - bbox[0] <= max_width:
            current = test
        else:
            if current:
                lines.append(current)
            current = w
    if current:
        lines.append(current)
    for i, line in enumerate(lines):
        draw.text((x, y + i * line_height), line, font=font, fill=fill)
    return len(lines)

def make_frame(pose_kr, pose_skt, steps, hue, frame_idx, total_frames):
    """Generate a single video frame."""
    t = frame_idx / total_frames  # 0..1 overall progress
    pulse = 0.5 + 0.5 * math.sin(frame_idx / FPS * math.pi)  # 0..1 breathing pulse

    # Background gradient
    bg_l = 92 + int(4 * pulse)
    bg_r, bg_g, bg_b = hsl_to_rgb(hue, 35, bg_l)
    img = Image.new('RGB', (W, H), (bg_r, bg_g, bg_b))
    draw = ImageDraw.Draw(img)

    # Decorative circle (breathing aura)
    aura_r = 180 + int(20 * pulse)
    aura_x, aura_y = W // 2, H // 2
    acc_r, acc_g, acc_b = hsl_to_rgb(hue, 55, 65)
    for radius in range(aura_r, aura_r - 40, -5):
        alpha = int(30 * (1 - (aura_r - radius) / 40) * pulse)
        overlay = Image.new('RGBA', (W, H), (0, 0, 0, 0))
        od = ImageDraw.Draw(overlay)
        od.ellipse(
            (aura_x - radius, aura_y - radius, aura_x + radius, aura_y + radius),
            fill=(acc_r, acc_g, acc_b, alpha)
        )
        img = Image.alpha_composite(img.convert('RGBA'), overlay).convert('RGB')
        draw = ImageDraw.Draw(img)

    # Fonts
    fn_large  = load_font(52)
    fn_medium = load_font(28)
    fn_small  = load_font(20)
    fn_step   = load_font(18)

    txt_dark = hsl_to_rgb(hue, 60, 20)
    txt_mid  = hsl_to_rgb(hue, 40, 38)
    txt_muted = hsl_to_rgb(hue, 20, 55)

    # Top bar
    bar_r, bar_g, bar_b = hsl_to_rgb(hue, 50, 45)
    draw.rectangle([(0, 0), (W, 6)], fill=(bar_r, bar_g, bar_b))

    # Pose name (Korean)
    name_bbox = draw.textbbox((0,0), pose_kr, font=fn_large)
    name_w = name_bbox[2] - name_bbox[0]
    draw.text(((W - name_w) // 2, 28), pose_kr, font=fn_large, fill=txt_dark)

    # Sanskrit name
    skt_bbox = draw.textbbox((0,0), pose_skt, font=fn_medium)
    skt_w = skt_bbox[2] - skt_bbox[0]
    draw.text(((W - skt_w) // 2, 92), pose_skt, font=fn_medium, fill=txt_mid)

    # Divider
    div_r, div_g, div_b = hsl_to_rgb(hue, 40, 72)
    draw.line([(80, 138), (W-80, 138)], fill=(div_r, div_g, div_b), width=2)

    # Steps: show all 5 steps, highlight current one
    step_start_y = 155
    step_section_h = H - step_start_y - 40
    step_h = step_section_h // len(steps)

    # Determine active step based on time
    active_step = int(t * len(steps))
    active_step = min(active_step, len(steps) - 1)

    for i, step in enumerate(steps):
        sy = step_start_y + i * step_h
        is_active = (i == active_step)

        # Active step background
        if is_active:
            hi_r, hi_g, hi_b = hsl_to_rgb(hue, 45, 55)
            hi_alpha = int(40 + 20 * pulse)
            overlay = Image.new('RGBA', (W, H), (0,0,0,0))
            od = ImageDraw.Draw(overlay)
            od.rounded_rectangle(
                [(60, sy - 4), (W-60, sy + step_h - 6)],
                radius=10, fill=(hi_r, hi_g, hi_b, hi_alpha)
            )
            img = Image.alpha_composite(img.convert('RGBA'), overlay).convert('RGB')
            draw = ImageDraw.Draw(img)

        # Step number circle
        num_x, num_y = 85, sy + step_h // 2 - 12
        circle_r, circle_g, circle_b = hsl_to_rgb(hue, 50, 45 if is_active else 68)
        draw.ellipse([(num_x-13, num_y), (num_x+13, num_y+24)],
                     fill=(circle_r, circle_g, circle_b))
        num_font = load_font(14)
        num_text = str(i + 1)
        nb = draw.textbbox((0,0), num_text, font=num_font)
        nw, nh = nb[2]-nb[0], nb[3]-nb[1]
        draw.text((num_x - nw//2, num_y + 12 - nh//2), num_text,
                  font=num_font, fill=(255,255,255))

        # Step text
        text_fill = txt_dark if is_active else txt_muted
        text_font = fn_step
        draw_text_wrapped(draw, step, 110, sy + 6, text_font, text_fill,
                          W - 180, 22)

    # Progress bar at bottom
    prog_w = int(W * t)
    draw.rectangle([(0, H-6), (W, H)], fill=hsl_to_rgb(hue, 20, 85))
    draw.rectangle([(0, H-6), (prog_w, H)], fill=hsl_to_rgb(hue, 50, 45))

    return np.array(img)

def generate_video(filename, pose_kr, pose_skt, hue, steps):
    out_path = os.path.join(OUT_DIR, filename)
    if os.path.exists(out_path) and os.path.getsize(out_path) > 5000:
        print(f'[SKIP] {filename}')
        return

    duration_sec = 3 * len(steps)  # 3 sec per step
    total_frames = duration_sec * FPS
    print(f'[GEN ] {filename}  ({duration_sec}s, {total_frames} frames)')

    frames = []
    for i in range(total_frames):
        frame = make_frame(pose_kr, pose_skt, steps, hue, i, total_frames)
        frames.append(frame)

    iio.imwrite(
        out_path, frames,
        plugin='pyav',
        codec='h264',
        fps=FPS,
        out_pixel_format='yuv420p',
    )
    size_kb = os.path.getsize(out_path) // 1024
    print(f'  OK  {size_kb} KB')

if __name__ == '__main__':
    for fname, kr, skt, hue, steps in POSES:
        try:
            generate_video(fname, kr, skt, hue, steps)
        except Exception as e:
            print(f'  ERR {fname}: {e}')
    print('\nAll done.')
