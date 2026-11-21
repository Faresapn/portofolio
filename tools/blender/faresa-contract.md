# Faresa at his desk: asset contract

Hero illustration for the portfolio hero (three.js, `components/DeskScene.tsx`). Stylised chibi, soft clay look,
seated at a desk, seen from a 3/4 rear-left camera. Built by `tools/blender/faresa.py`.

## Reference (from the user's photos)
- Young Indonesian man, warm tan skin, oval face, **clean-shaven** (no moustache, no beard).
- Black hair: short sides, volume on top swept up and back into a quiff, slightly to his left.
- Thick straight black brows, dark eyes, broad nose.
- Outfit from the riding photo: red-orange tee, open dark-grey jacket, grey trousers, green sneakers.
- Hobbies to show as props: motorcycle (full-face helmet, purple visor like his rims), hiking (pack), fishing (rod),
  gaming (controller).

## Proportions (units; seated figure ≈ 1.0 from floor to crown)
- Head: radius 0.20, about 0.40 of seated height (chibi). Crown at y ≈ 1.53.
- Torso: 0.30 wide (shoulder to shoulder 0.38), 0.34 tall, 0.30 deep.
- Upper arm 0.25, forearm 0.24, hand blob ≈ 0.09 long.
- Thigh 0.28 horizontal on the seat (seat top y 0.46), shin 0.38 down to the floor.

## Construction
- Rigid parts, each with its origin on its joint: `legs` (hips), `torso`, `head`, `eyes`, `upperArm_L/R`,
  `foreArm_L/R`, `hand_L/R`, `chair` (swivel pivot). Everything else is static scenery.
- Arm segments are modelled along +Y from their joint so the page can point them with two-bone IK.
- Hair is one metaball mass (cap + quiff), not stacked spheres. Jacket is one mass with the tee showing at the front.
- Faces +X (towards the monitor). Axes as three.js.

## Palette (material slots)
skin #c48c68 · hair #1d1a18 · tee #e2522b · jacket #3b3e44 · pants #7d8088 · shoe #3f6f4e · sole #f1efe9 ·
desk #f4f1ea · deskLeg #c9a27a · chair #f6f6f4 · metal #8f949b · monitor #2b2d33 · rug #e7b45b / #f1d48a

## Motion (in the page)
Typing idle with breathing; blink; small slow glance towards the pointer (≤ 7°). Every 12 s the chair swivels about
60° towards the viewer, the near hand waves beside his head, then he turns back. Defining motion: the swivel-and-wave.

## Budget
One scene, one character, desktop and phone: under ~60k triangles total, one draw call per part.
