# Faresa at his desk: the hero scene of the portfolio, built entirely by script.
# Contract: tools/blender/faresa-contract.md. Page: components/DeskScene.tsx.
# Run:  blender -b --factory-startup -P tools/blender/faresa.py -- public/models/faresa-desk [--preview]
# Axes: three.js (x right, y up, z towards the viewer); the character faces +x, towards the monitor.
import sys, os, math
sys.path.insert(0, os.path.dirname(__file__))
from blender_kit import *  # noqa: F401,F403
import blender_kit as bk
import bmesh, bpy
from mathutils import Vector, Matrix

OUT, PREVIEW = start()

materials({
    'skin': '#c48c68', 'hair': '#1d1a18', 'eye': '#191615', 'sclera': '#f3efe9', 'lip': '#a8705c', 'brow': '#1d1a18', 'mouth': '#7a4434',
    'tee': '#e2522b', 'jacket': '#3b3e44', 'pants': '#7d8088', 'shoe': '#3f6f4e', 'sole': '#f1efe9',
    'chair': '#f6f6f4', 'metal': '#8f949b', 'desk': '#f4f1ea', 'deskLeg': '#c9a27a', 'monitor': '#2b2d33',
    'keyboard': '#e9e7e2', 'mug': '#2f58cc', 'pot': '#ece6dc', 'leaf': '#6bbf59', 'helmet': '#17181b',
    'visor': '#6a4fd8', 'rugOuter': '#e7b45b', 'rugInner': '#f1d48a', 'pad': '#2b2d33', 'btnRed': '#e2522b',
    'btnBlue': '#2f58cc', 'btnGreen': '#6bbf59', 'btnYellow': '#f2c76e', 'rod': '#3a3d45', 'rodGrip': '#7a4f32',
    'reel': '#c9ccd2', 'bobber': '#e2522b', 'pack': '#d9822b', 'packDark': '#b86a1f', 'packRoll': '#3f6f4e',
    'patch': '#f4f1ea',
})

V = Vector


def at(j, x, y, z):
    """joint + local offset, both three.js axes"""
    return (j[0] + x, j[1] + y, j[2] + z)


MB_K = 0.574  # a lone metaball element's surface sits at ~0.574 x its radius (threshold 0.6, measured)


def blob(elems, res=0.013):
    """metaball mass; elems: (centre, radius, radii or None) in three axes. Numbers are the surface size you get for a
    lone element: radius for a ball, or (rx, ry, rz) for an ellipsoid. Neighbouring elements blend and swell a little."""
    out = []
    for c, r, s in elems:
        if s:
            m = max(s); out.append(('ELLIPSOID', c, m / MB_K, tuple(v / m for v in s)))
        else:
            out.append(('BALL', c, r / MB_K, None))
    return metaball('mb', out, res=res)


def tube(a, b, r0, r1, seg=20):
    """capsule-ish tube between two points (three axes), smooth ends"""
    mid = [(a[i] * (1 - t) + b[i] * t) for t in (0.5,) for i in range(3)]
    return curve_bm([a, mid, b], 1.0, radii=[r0, (r0 + r1) / 2, r1], res=4)


def obj(name, parts, origin, smooth=True):
    """parts: list of (bmesh, material) joined into one object with its origin on a joint"""
    names = []
    for _, m in parts:
        if m not in names: names.append(m)
    for bm, m in parts: mat_all(bm, names.index(m))
    return mesh_obj(name, join_bm(*[bm for bm, _ in parts]), names, origin=origin, smooth=smooth)


# ─── Joints (keep in sync with DeskScene.tsx, which reads them from the node positions) ─────────────
ROOT = (-0.30, 0.46, 0.02)            # hips, on the seat
TORSO = at(ROOT, 0, 0.06, 0)
HEAD = at(TORSO, 0.02, 0.60, 0)
SHOULDER = {s: at(TORSO, 0.01, 0.36, s * 0.19) for s in (-1, 1)}
UPPER, FORE = 0.25, 0.24
CHAIR = (-0.32, 0.0, 0.02)

# ─── Character ────────────────────────────────────────────────────────────────────────────────────

# legs: thighs along the seat, shins down, sneakers (static, hang off the hips)
legs = []
for s in (-1, 1):
    z = ROOT[2] + s * 0.09
    hip, knee, ankle = at(ROOT, 0.02, 0.06, s * 0.09), at(ROOT, 0.31, 0.06, s * 0.09), at(ROOT, 0.36, -0.34, s * 0.09)
    legs.append((tube(hip, knee, 0.072, 0.064), 'pants'))
    legs.append((tube(knee, ankle, 0.062, 0.052), 'pants'))
    legs.append((blob([(at(ROOT, 0.42, -0.385, s * 0.09), 0.06, (0.1, 0.045, 0.055)),
                       (at(ROOT, 0.37, -0.37, s * 0.09), 0.05, None)]), 'shoe'))
    legs.append((ellipsoid(at(ROOT, 0.41, -0.418, s * 0.09), (0.1, 0.014, 0.058)), 'sole'))
legs.append((blob([(at(ROOT, 0.02, 0.05, 0), 0.12, (0.13, 0.09, 0.17))]), 'pants'))  # seat of the trousers
obj('legs', legs, ROOT)

# torso: one jacket mass (chest, belly, shoulders) with the tee showing down the front, plus a collar ring
jacket = blob(res=0.016, elems=[
    (at(TORSO, 0, 0.21, 0), 0.16, (0.15, 0.17, 0.17)),
    (at(TORSO, 0, 0.08, 0), 0.15, (0.15, 0.1, 0.15)),
    (at(TORSO, 0.0, 0.33, -0.15), 0.08, None),
    (at(TORSO, 0.0, 0.33, 0.15), 0.08, None),
])
tee = ellipsoid(at(TORSO, 0.095, 0.2, 0), (0.08, 0.15, 0.1))   # wide open jacket front
collar = torus(0.072, 0.024, xf=None)
for v in collar.verts: v.co = v.co + T(*at(TORSO, 0.01, 0.4, 0))
neck = ellipsoid(at(TORSO, 0.02, 0.47, 0), (0.072, 0.075, 0.075))   # thick neck, as in the photo
obj('torso', [(jacket, 'jacket'), (tee, 'tee'), (collar, 'jacket'), (neck, 'skin')], TORSO)

# head, matched to his ID photo (facing +x, so his right is +z):
# - round, wide face: cheeks and jaw wider than the forehead, full lower face
# - hair parted on his right, swept up and over to his left with volume on top; short tapered sides
# - large round eyes with the whites showing; thick, slightly arched brows
# - broad nose with wide nostrils; full lips, neutral expression; ears that stand out a little
# - clean-shaven
face = blob([
    (at(HEAD, 0.0, 0.12, 0), 0.2, (0.185, 0.19, 0.188)),        # cranium
    (at(HEAD, 0.04, 0.03, 0), 0.14, (0.14, 0.115, 0.182)),      # full cheeks and wide jaw
    (at(HEAD, 0.075, -0.035, 0), 0.08, (0.09, 0.06, 0.11)),     # rounded chin
], res=0.012)
# Features are placed on the actual face surface (ray cast from the front), so nothing sinks in.
_probe = mesh_obj('faceProbe', face.copy(), ['skin'], coll=bk.AUX)
bpy.context.view_layer.update()


def onface(y, z, lift=0.0):
    hit = surf(_probe, (HEAD[0] + 1.0, HEAD[1] + y, HEAD[2] + z), (-1, 0, 0), 2.0)
    p, n = hit
    return tuple(p + n * lift), n


ears = [ellipsoid(at(HEAD, -0.005, 0.085, s * 0.2), (0.032, 0.058, 0.03)) for s in (-1, 1)]
tip, _ = onface(0.055, 0, 0.012)
nose = blob([(tip, 0.026, (0.025, 0.032, 0.025))] +
            [(onface(0.038, s * 0.027, 0.003)[0], 0.016, (0.015, 0.014, 0.018)) for s in (-1, 1)], res=0.007)
lips = [
    (ellipsoid(onface(-0.018, 0, 0.0)[0], (0.009, 0.008, 0.042)), 'lip'),     # upper lip
    (ellipsoid(onface(-0.038, 0, 0.001)[0], (0.011, 0.011, 0.039)), 'lip'),   # fuller lower lip
    (ellipsoid(onface(-0.028, 0, 0.006)[0], (0.004, 0.0025, 0.04)), 'mouth'),  # closed mouth line
]
hair = blob([
    (at(HEAD, -0.07, 0.2, 0), 0.2, (0.17, 0.14, 0.18)),            # cap over the back and top, high on the forehead
    (at(HEAD, 0.02, 0.33, -0.02), 0.1, (0.14, 0.08, 0.15)),        # volume on top
    (at(HEAD, 0.1, 0.36, -0.06), 0.07, (0.09, 0.065, 0.11)),       # front wave, swept up and over to his left (-z)
    (at(HEAD, 0.06, 0.29, -0.14), 0.06, (0.09, 0.07, 0.05)),       # the wave falls to his left side
    (at(HEAD, -0.01, 0.25, 0.14), 0.06, (0.13, 0.045, 0.05)),      # his right side: flatter, beside the part
    (at(HEAD, -0.07, 0.13, -0.165), 0.05, (0.08, 0.06, 0.02)),     # short sides
    (at(HEAD, -0.07, 0.13, 0.165), 0.05, (0.08, 0.06, 0.02)),
], res=0.01)
# thick, slightly arched brows that follow the forehead
brows = []
for s in (-1, 1):
    pts = [onface(0.178, s * 0.035, 0.006)[0], onface(0.186, s * 0.075, 0.006)[0], onface(0.176, s * 0.112, 0.004)[0]]  # level, soft arch
    brows.append((curve_bm(pts, 0.012, radii=[0.85, 1.0, 0.7]), 'brow'))
obj('head', [(face, 'skin'), *[(e, 'skin') for e in ears], (nose, 'skin'), *lips, (hair, 'hair'),
             *brows], HEAD)
# eyes: whites with a large dark iris; one object so the page can blink it
EYE = at(HEAD, 0.17, 0.125, 0)
eyes = []
for s in (-1, 1):
    c, n = onface(0.125, s * 0.073)
    eyes.append((ellipsoid(tuple(V(c) - n * 0.006), (0.02, 0.03, 0.035)), 'sclera'))
    eyes.append((ellipsoid(tuple(V(c) + n * 0.008), (0.008, 0.021, 0.021)), 'eye'))
    eyes.append((ellipsoid(tuple(V(c) + n * 0.015 + V((0, 0.007, 0.006))), (0.002, 0.005, 0.005)), 'sclera'))
obj('eyes', eyes, EYE)

# arms: modelled along +Y from their joint so the page can aim them; sleeves taper, hands are soft mitts
for s, side in ((-1, 'R'), (1, 'L')):
    sh = SHOULDER[s]
    obj('upperArm_' + side, [(tube(sh, at(sh, 0, UPPER, 0), 0.06, 0.054), 'jacket'),
                             (ellipsoid(sh, (0.064, 0.064, 0.064)), 'jacket')], sh)
    el = at(sh, 0, UPPER, 0)
    obj('foreArm_' + side, [(tube(el, at(el, 0, FORE, 0), 0.053, 0.046), 'jacket')], el)
    wr = at(el, 0, FORE, 0)
    obj('hand_' + side, [(blob([(at(wr, 0, 0.045, 0), 0.05, (0.042, 0.055, 0.03)),
                                (at(wr, 0.026, 0.03, 0), 0.022, None)]), 'skin')], wr)

# ─── Chair (swivels as one piece) ───────────────────────────────────────────────────────────────
chair = [
    (box(at(CHAIR, 0, 0.415, 0), (0.44, 0.06, 0.46), bevel=0.025, seg=3), 'chair'),
    (box(at(CHAIR, -0.235, 0.68, 0), (0.05, 0.4, 0.42), bevel=0.02, seg=3), 'chair'),
    (tube(at(CHAIR, 0, 0.06, 0), at(CHAIR, 0, 0.39, 0), 0.028, 0.028), 'metal'),
    (tube(at(CHAIR, -0.2, 0.44, 0), at(CHAIR, -0.235, 0.5, 0), 0.02, 0.02), 'metal'),
]
for i in range(5):
    a = i / 5 * 2 * math.pi
    tip = at(CHAIR, math.cos(a) * 0.23, 0.035, math.sin(a) * 0.23)
    chair.append((tube(at(CHAIR, 0, 0.06, 0), tip, 0.018, 0.016), 'metal'))
    chair.append((ellipsoid(at(tip, 0, -0.01, 0), (0.026, 0.024, 0.026)), 'metal'))
obj('chair', chair, CHAIR)

# ─── Room (static) ──────────────────────────────────────────────────────────────────────────────
room = []
rug_pts = lambda R, y, h: [(0.0, y)] + [(R * k / 10, y + h) for k in range(1, 11)] + [(R + 0.012, y + h / 2), (R, y)]
room.append((lathe(rug_pts(1.18, 0.0, 0.04), seg=64), 'rugOuter'))
room.append((lathe(rug_pts(0.95, 0.0, 0.05), seg=64), 'rugInner'))
for bm, _ in room[-2:]:
    for v in bm.verts: v.co += T(0.12, 0, 0.1)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)   # lathe winds the top face downwards
# desk
room.append((box((0.42, 0.76, 0), (0.7, 0.05, 1.5), bevel=0.02, seg=3), 'desk'))
for x, z in ((0.14, -0.66), (0.7, -0.66), (0.14, 0.66), (0.7, 0.66)):
    room.append((tube((x, 0.02, z), (x, 0.74, z), 0.022, 0.026), 'deskLeg'))
# monitor (the screen picture is a plane added by the page at x = 0.586)
MON = (0.62, 0.785, 0.02)
room.append((ellipsoid(at(MON, 0, 0.008, 0), (0.11, 0.01, 0.13)), 'monitor'))
room.append((box(at(MON, 0.02, 0.12, 0), (0.03, 0.22, 0.05), bevel=0.01), 'monitor'))
room.append((box(at(MON, 0, 0.42, 0), (0.04, 0.44, 0.72), bevel=0.015, seg=3), 'monitor'))
room.append((box((0.2, 0.795, 0.02), (0.16, 0.02, 0.46), bevel=0.008), 'keyboard'))
# mug
MUG = (0.28, 0.785, 0.5)
room.append((lathe([(0.0, 0.0), (0.045, 0.0), (0.05, 0.11), (0.04, 0.11), (0.036, 0.01), (0.0, 0.01)], seg=32), 'mug'))
for v in room[-1][0].verts: v.co += T(*MUG)
bmesh.ops.recalc_face_normals(room[-1][0], faces=room[-1][0].faces)
h = torus(0.03, 0.009, seg=24, rseg=8, xf=Matrix.Rotation(math.pi / 2, 3, 'X'))
for v in h.verts: v.co += T(*at(MUG, 0, 0.06, 0.05))
room.append((h, 'mug'))
# plant
POT = (0.55, 0.785, -0.58)
room.append((lathe([(0.0, 0.0), (0.055, 0.0), (0.07, 0.12), (0.06, 0.12), (0.0, 0.11)], seg=32), 'pot'))
for v in room[-1][0].verts: v.co += T(*POT)
bmesh.ops.recalc_face_normals(room[-1][0], faces=room[-1][0].faces)
room.append((blob([(at(POT, 0.035 * math.sin(i * 1.26), 0.18 + 0.02 * (i % 2), 0.035 * math.cos(i * 1.26)), 0.05, (0.025, 0.075, 0.045)) for i in range(5)]), 'leaf'))
# game controller
PAD = (0.4, 0.8, 0.64)
room.append((blob([(at(PAD, 0, 0.025, 0), 0.05, (0.04, 0.022, 0.07)),
                   (at(PAD, -0.03, 0.02, -0.06), 0.04, (0.04, 0.025, 0.035)),
                   (at(PAD, -0.03, 0.02, 0.06), 0.04, (0.04, 0.025, 0.035))]), 'pad'))
for i, m in enumerate(('btnRed', 'btnBlue', 'btnGreen', 'btnYellow')):
    room.append((ellipsoid(at(PAD, 0.012 + (i % 2) * 0.014, 0.05, 0.035 + (i // 2) * 0.014), (0.007, 0.006, 0.007)), m))
# helmet: shell, purple visor band, chin ring
HEL = (-0.1, 0.05, 0.85)
room.append((ellipsoid(at(HEL, 0, 0.14, 0), (0.14, 0.133, 0.151), seg=32, rings=24), 'helmet'))
visor = ellipsoid(at(HEL, 0, 0.14, 0), (0.146, 0.139, 0.157), seg=32, rings=24)
yaw = 0.85; fwd = V((-math.cos(yaw), 0, math.sin(yaw)))        # visor faces the camera side
bmesh.ops.delete(visor, geom=[f for f in visor.faces if not (
    to3(f.calc_center_median()).y - (HEL[1] + 0.14) > -0.035 and to3(f.calc_center_median()).y - (HEL[1] + 0.14) < 0.05
    and (to3(f.calc_center_median()) - V(at(HEL, 0, 0.14, 0))).normalized().dot(fwd) > 0.5)], context='FACES')   # ~120° front visor
room.append((visor, 'visor'))
room.append((torus(0.11, 0.022, seg=32, rseg=8, xf=None), 'helmet'))
for v in room[-1][0].verts: v.co += T(*at(HEL, 0, 0.03, 0))
# hiking pack with a rolled mat and a mountain patch
PACK = (-0.62, 0.05, -0.42)
room.append((box(at(PACK, 0, 0.21, 0), (0.2, 0.42, 0.3), bevel=0.06, seg=4), 'pack'))
room.append((box(at(PACK, 0.11, 0.17, 0), (0.07, 0.16, 0.22), bevel=0.03, seg=3), 'packDark'))
roll = lathe([(0.0, -0.16), (0.06, -0.16), (0.06, 0.16), (0.0, 0.16)], seg=24, cap0=False)
for v in roll.verts:
    p = to3(v.co); v.co = T(PACK[0] + p.x, PACK[1] + 0.46 + p.z, PACK[2] + p.y)   # lie it along z
room.append((roll, 'packRoll'))
peak = lathe([(0.0, 0.0), (0.045, 0.0), (0.0, 0.06)], seg=3)
for v in peak.verts:
    p = to3(v.co); v.co = T(PACK[0] + 0.15 + p.y * 0.3, PACK[1] + 0.2 + p.x, PACK[2] + p.z)
room.append((peak, 'patch'))
# fishing rod leaning behind the pack
ROD0, ROD1 = (-0.62, 0.04, -0.6), (-0.66, 1.3, -0.74)
room.append((tube(ROD0, ROD1, 0.013, 0.005), 'rod'))
grip1 = tuple(ROD0[i] + (ROD1[i] - ROD0[i]) * 0.22 for i in range(3))
room.append((tube(ROD0, grip1, 0.018, 0.017), 'rodGrip'))
reelp = tuple(ROD0[i] + (ROD1[i] - ROD0[i]) * 0.28 for i in range(3))
room.append((ellipsoid(at(reelp, 0.03, 0, 0), (0.025, 0.04, 0.04)), 'reel'))
room.append((ellipsoid(ROD1, (0.02, 0.02, 0.02)), 'bobber'))
obj('room', room, (0, 0, 0))

if '--face' in sys.argv:
    # front and 3/4 close-up of the head for comparing with his ID photo
    for o in list(bk.CHAR.objects):
        if o.name not in ('head', 'eyes', 'torso'): o.hide_render = True
    cam = bpy.data.objects.new('cam', bpy.data.cameras.new('cam')); bk.sc.collection.objects.link(cam); bk.sc.camera = cam
    cam.data.type = 'ORTHO'; cam.data.ortho_scale = 0.62
    bk.sc.render.engine = 'BLENDER_WORKBENCH'; bk.sc.render.resolution_x = bk.sc.render.resolution_y = 700
    sh = bk.sc.display.shading; sh.light = 'STUDIO'; sh.color_type = 'MATERIAL'; sh.show_cavity = True
    look = V(at(HEAD, 0, 0.09, 0))
    for tag, d in (('front', (1, 0, 0)), ('three', (0.75, 0.05, -0.65))):
        cam.location = T(*(look + V(d).normalized() * 3))
        cam.rotation_euler = (T(*look) - cam.location).to_track_quat('-Z', 'Y').to_euler()
        bk.sc.render.filepath = OUT + '_face_' + tag + '.png'; bpy.ops.render.render(write_still=True)
elif PREVIEW:
    preview_turns(OUT, angles=(math.pi / 2, math.pi / 4, 0, -math.pi / 4), height=0.7, scale=7.5, res=(2000, 520))
else:
    bake_ao(groups=[['head', 'eyes'], ['upperArm_L', 'foreArm_L', 'hand_L'], ['upperArm_R', 'foreArm_R', 'hand_R'], ['chair']])
    export_model(OUT)
