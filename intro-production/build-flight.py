"""Reproducible connected-room opening. Run with Blender --background --python.

Use -- --preview for selected frames; otherwise renders the 30-second sequence.
The scene is original geometry; existing portfolio artwork is used on the walls.
"""
import bpy, math, random, sys
from pathlib import Path
from mathutils import Vector

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'tmp' / 'intro-flight'
OUT.mkdir(parents=True, exist_ok=True)
random.seed(18)
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
scene = bpy.context.scene
scene.render.engine = 'BLENDER_EEVEE'
scene.eevee.taa_render_samples = 8
scene.render.resolution_x = 1280
scene.render.resolution_y = 720
scene.render.resolution_percentage = 75
scene.render.fps = 24
scene.frame_end = 720
scene.world.color = (.035, .045, .07)
scene.view_settings.view_transform = 'AgX'
scene.render.image_settings.file_format = 'PNG'

def mat(name, color, metal=0, rough=.5, emission=0):
    m = bpy.data.materials.new(name); m.diffuse_color = (*color, 1); m.use_nodes = True
    p = m.node_tree.nodes.get('Principled BSDF')
    p.inputs['Base Color'].default_value = (*color, 1)
    p.inputs['Metallic'].default_value = metal
    p.inputs['Roughness'].default_value = rough
    if emission:
        p.inputs['Emission Color'].default_value = (*color, 1)
        p.inputs['Emission Strength'].default_value = emission
    return m

wood = mat('Smoked walnut', (.105,.048,.025), rough=.32)
# Object-space grain follows the furniture rather than screen-space overlays.
n = wood.node_tree.nodes; links = wood.node_tree.links
tex = n.new('ShaderNodeTexNoise'); tex.inputs['Scale'].default_value=5
coord = n.new('ShaderNodeTexCoord'); mapping=n.new('ShaderNodeVectorMath'); mapping.operation='MULTIPLY'; mapping.inputs[1].default_value=(3, .25, 8)
links.new(coord.outputs['Generated'],mapping.inputs[0]);links.new(mapping.outputs[0],tex.inputs['Vector'])
ramp=n.new('ShaderNodeValToRGB');ramp.color_ramp.elements[0].color=(.018,.008,.004,1);ramp.color_ramp.elements[1].color=(.19,.085,.035,1)
links.new(tex.outputs['Fac'],ramp.inputs[0]);links.new(ramp.outputs[0],n.get('Principled BSDF').inputs['Base Color'])
wall=mat('Deep olive plaster',(.055,.072,.055),rough=.9)
cream=mat('Warm porcelain',(.72,.64,.48),rough=.25)
brass=mat('Aged brass',(.4,.24,.075),metal=.75,rough=.3)
black=mat('Black bakelite',(.012,.017,.015),rough=.3)
fabric=mat('Charcoal wool',(.024,.03,.032),rough=.92)
leather=mat('Tobacco leather',(.16,.065,.025),rough=.65)
coffee=mat('Coffee',(.018,.007,.003),rough=.13)
glow=mat('Tungsten', (1,.48,.14), emission=3)
screen=mat('CRT phosphor',(.012,.03,.022),emission=.25)
lettering=mat('CRT lettering',(.65,.8,.57),emission=1.5)
blue=mat('Rain blue',(.1,.21,.32),metal=.4,rough=.15)

def cube(name, loc, size, material, bevel=.025):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc)
    o=bpy.context.object;o.name=name;o.dimensions=size
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    if material:o.data.materials.append(material)
    if bevel:
        mod=o.modifiers.new('Soft manufactured edges','BEVEL');mod.width=bevel;mod.segments=3
        o.modifiers.new('Weighted normals','WEIGHTED_NORMAL')
    return o

def sphere(name,loc,scale,material):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=24,ring_count=12,location=loc)
    o=bpy.context.object;o.name=name;o.scale=scale;o.data.materials.append(material)
    for p in o.data.polygons:p.use_smooth=True
    return o

def cylinder(name,loc,r,depth,material,rotation=None):
    bpy.ops.mesh.primitive_cylinder_add(vertices=40,radius=r,depth=depth,location=loc)
    o=bpy.context.object;o.name=name;o.data.materials.append(material)
    if rotation:o.rotation_euler=rotation
    mod=o.modifiers.new('Edge highlight','BEVEL');mod.width=.012;mod.segments=2
    o.modifiers.new('Weighted normals','WEIGHTED_NORMAL')
    return o

def light(name,loc,power,color,size=2,target=None):
    d=bpy.data.lights.new(name,'AREA');d.energy=power;d.color=color;d.shape='DISK';d.size=size
    o=bpy.data.objects.new(name,d);scene.collection.objects.link(o);o.location=loc
    if target:o.rotation_euler=(Vector(target)-o.location).to_track_quat('-Z','Y').to_euler()
    return o

def text(body,loc,size,material):
    c=bpy.data.curves.new(body,'FONT');c.body=body;c.align_x='CENTER';c.size=size;c.extrude=.0005
    o=bpy.data.objects.new(body,c);scene.collection.objects.link(o);o.location=loc;o.rotation_euler=(math.pi/2,0,0);c.materials.append(material)
    return o

# A single connected house, with open doorways that the camera actually traverses.
cube('Foundation',(0,1,-.11),(10,16,.2),wood)
for x in range(20):
    for y in range(8):
        cube('Individual floorboard',(-4.75+x*.5,-6+y*2,.012),(.487,1.987,.035),wood,.006)
cube('Left wall',(-5,1,1.7),(.18,16,3.4),wall)
cube('Right wall',(5,1,1.7),(.18,16,3.4),wall)
cube('Back wall',(0,9,1.7),(10,.18,3.4),wall)
cube('Ceiling',(0,1,3.45),(10,16,.12),wall)
for x in [-4.85,4.85]:cube('Skirting',(x,1,.15),(.07,16,.23),wood)
# Kitchen window: open middle pane permits the first flight into the room.
for x in [-5,-2,2,5]:cube('Window upright',(x,-5.2,1.7),(.12,.13,3.4),wood)
for z in [.25,3.2]:cube('Window lintel',(0,-5.2,z),(10,.18,.14),wood)
cube('Kitchen partition left',(-3,1,1.7),(4,.15,3.4),wall)
cube('Kitchen partition right',(3.75,1,1.7),(2.5,.15,3.4),wall)
cube('Doorway lintel',(.75,1,3.05),(3.5,.2,.7),wood)
for x in [-1,2.5]:cube('Doorway trim',(x,1,1.5),(.13,.25,3),wood)

# Kitchen counters, cabinet seams, brass pulls, tile backsplash, coffee vignette.
cube('Kitchen cabinets',(-4,-1.9,.49),(1.7,5,.94),wood)
cube('Stone countertop',(-4,-1.9,1),(1.85,5.1,.12),black)
for y in [-3.7,-2.5,-1.3,-.1]:
    cube('Cabinet panel',(-3.13,y,.5),(.04,1.14,.83),wall)
    cube('Brass cabinet pull',(-3.09,y,.8),(.045,.25,.035),brass)
for y in range(10):
    for z in range(3):cube('Kitchen tile',(-4.88,-4.1+y*.5,1.2+z*.25),(.025,.49,.24),cream,.003)
cylinder('Coffee saucer',(-3.65,-1.8,1.09),.23,.028,cream)
cylinder('Coffee cup',(-3.65,-1.8,1.205),.135,.21,cream)
cylinder('Coffee surface',(-3.65,-1.8,1.313),.119,.006,coffee)
bpy.ops.mesh.primitive_torus_add(major_radius=.08,minor_radius=.019,location=(-3.49,-1.8,1.21),rotation=(math.pi/2,0,0))
bpy.context.object.data.materials.append(cream)
cube('Coffee notebook',(-3.8,-.85,1.09),(.55,.72,.065),leather)
cylinder('Coffee tin',(-4.5,-2,1.28),.17,.46,brass)
cube('Espresso machine',(-4.15,-3.5,1.32),(.65,.6,.58),brass,.06)
cube('Espresso front',(-3.81,-3.5,1.36),(.02,.5,.34),black)
light('Kitchen warm pool',(-3.8,-1.8,2.45),190,(1,.59,.28),1.4,(-3.8,-1.8,1))
cylinder('Pendant wire',(-3.8,-1.8,3),.012,.6,black)
bpy.ops.mesh.primitive_cone_add(vertices=40,radius1=.42,radius2=.13,depth=.28,location=(-3.8,-1.8,2.65))
bpy.context.object.data.materials.append(black)
sphere('Pendant bulb',(-3.8,-1.8,2.52),(.08,.08,.07),glow)

# Lounge furnishings.
cube('Woven rug',(0,5,.05),(5.7,5,.025),mat('Muted rug',(.12,.1,.065),rough=1))
for x in [-2.7,2.7]:cube('Rug stripe',(x,5,.067),(.035,4.8,.006),cream,.001)
cube('Console',(0,7.6,.47),(3.4,.8,.65),wood)
for x in [-1.4,1.4]:
    for y in [7.3,7.9]:cube('Console leg',(x,y,.17),(.1,.1,.3),black)
cube('CRT wooden cabinet',(0,7.45,1.47),(2.5,.65,1.44),wood,.09)
cube('CRT bezel',(-.2,7.1,1.49),(1.93,.09,1.16),black,.09)
cube('Convex CRT glass',(-.2,7.035,1.49),(1.68,.08,.96),screen,.12)
cube('Tuning panel',(1,7.07,1.49),(.35,.08,1.14),black)
for z in [1.75,1.43]:cylinder('Tuning dial',(1,7,z),.105,.07,brass,(math.pi/2,0,0))
for z in range(6):cube('Speaker grille',(1,7.01,1.01+z*.045),(.25,.02,.012),brass,.001)
text('S V M',(-.2,6.98,1.5),.23,lettering)
text('P R E S E N T S',(-.2,6.98,1.27),.065,lettering)
light('CRT bounce',(-.2,6.9,1.5),42,(.53,.8,.66),1.2,(0,4.5,1.2))
# Seat and anonymous clothed person from behind. No facial likeness is used.
cube('Armchair seat',(-1,4.25,.45),(1.1,1.05,.3),leather,.14)
cube('Armchair back',(-1,3.85,.85),(1.1,.24,1),leather,.1)
for x in [-1.58,-.42]:cube('Armrest',(x,4.25,.7),(.18,1.05,.35),leather,.08)
sphere('Seated coat',(-1,4.22,1.05),(.35,.23,.54),fabric)
sphere('Anonymous head',(-1,4.29,1.69),(.17,.17,.22),fabric)
for x in [-1.22,-.78]:
    sphere('Trouser leg',(x,4.63,.55),(.14,.4,.14),fabric)
    sphere('Shoe',(x,4.9,.17),(.13,.25,.09),black)
cube('Side table',(-2.5,4.6,.62),(.75,.75,.08),wood)
cylinder('Table stem',(-2.5,4.6,.32),.04,.6,brass)
cylinder('Lamp foot',(2.6,6.5,.06),.3,.08,black)
cylinder('Lamp stem',(2.6,6.5,1.15),.025,2.2,brass)
bpy.ops.mesh.primitive_cone_add(vertices=48,radius1=.5,radius2=.3,depth=.48,location=(2.6,6.5,2.2))
bpy.context.object.data.materials.append(cream)
sphere('Lamp bulb',(2.6,6.5,1.98),(.1,.1,.1),glow)
light('Lounge practical',(2.6,6.5,1.88),250,(1,.62,.3),2,(0,5,1))
light('Warm wall wash',(-3.5,7.8,2.6),120,(1,.53,.25),2,(0,7.5,1))
light('Moon through window',(0,-6,3),650,(.24,.47,1),4,(0,0,.8))
light('Cool room fill',(4,3,2.7),100,(.34,.5,.75),3,(0,4,1))

# Foreground plant provides real parallax on the lounge arc.
cylinder('Plant pot',(3.6,4.5,.35),.28,.65,leather)
leafmat=mat('Rubber plant leaves',(.025,.085,.035),rough=.4)
for i in range(9):
    angle=i*2.4; height=.7+i*.14
    cylinder('Plant stem',(3.6,4.5,height/2+.3),.013,height,wood)
    leaf=sphere('Plant leaf',(3.6+math.cos(angle)*.26,4.5+math.sin(angle)*.26,height),(.35,.12,.035),leafmat)
    leaf.rotation_euler=(.2,.25,angle)
# Thin curling steam above the cup, animated gently in the kitchen insert.
steammat=mat('Steam highlight',(.3,.36,.37),rough=1)
for strand in range(3):
    curve=bpy.data.curves.new('Coffee steam','CURVE');curve.dimensions='3D';curve.bevel_depth=.0025;curve.bevel_resolution=2
    spline=curve.splines.new('BEZIER');spline.bezier_points.add(9)
    for i,p in enumerate(spline.bezier_points):
        p.co=(math.sin(i*.8+strand)*.025,math.cos(i*.6+strand)*.02,i*.035)
        p.handle_left_type=p.handle_right_type='AUTO'
    steam=bpy.data.objects.new('Coffee steam',curve);scene.collection.objects.link(steam);curve.materials.append(steammat)
    for f in [1,96,192,264,720]:
        steam.location=(-3.65+strand*.025,-1.8,1.32);steam.rotation_euler.z=f*.012+strand
        steam.keyframe_insert(data_path='rotation_euler',frame=f)

# Books, records, framed photographs establish scale and continuity during travel.
for z in [.5,1.3,2.1]:cube('Bookshelf',(-4.65,5,z),(.5,3,.07),wood)
for i in range(24):
    h=random.uniform(.35,.65);y=3.7+i*.105
    cube('Book spine',(-4.6,y,1.34+h/2),(.35,.075,h),random.choice([cream,wood,leather,wall]),.005)
def artwork(path,x,z,width):
    m=bpy.data.materials.new('Framed '+path);m.use_nodes=True
    t=m.node_tree.nodes.new('ShaderNodeTexImage');t.image=bpy.data.images.load(str(ROOT/'assets'/path))
    m.node_tree.links.new(t.outputs['Color'],m.node_tree.nodes.get('Principled BSDF').inputs['Base Color'])
    h=width*941/1672
    cube('Picture frame',(x,8.86,z),(width+.12,.08,h+.12),brass)
    bpy.ops.mesh.primitive_plane_add(size=2,location=(x,8.81,z),rotation=(math.pi/2,0,0))
    o=bpy.context.object;o.scale=(width/2,h/2,1);o.data.materials.append(m)
artwork('01-exterior-rain.png',-2.6,2.3,1.7)
artwork('04-kitchen-coffee.png',2.6,2.55,1.4)

# Exterior rain streaks move through real depth, with a clear central camera path.
for i in range(130):
    x=random.uniform(-5,5); y=random.uniform(-9,-5.5); z=random.uniform(0,4)
    o=cylinder('Rain',(x,y,z),.0012,random.uniform(.09,.22),blue)
    for f in [1,720]:
        o.location.z=z-(f-1)/719*3;o.keyframe_insert(data_path='location',frame=f)

bpy.ops.object.camera_add()
cam=bpy.context.object;scene.camera=cam;cam.data.lens=24;cam.data.clip_start=.03
# Dolly through window, arc round the coffee, cross the doorway, orbit the chair,
# then settle into the television. Bezier handles give continuous acceleration.
shots=[
 (1,(.5,-8,2.05),(-2.4,-1.5,1.3),27),
 (96,(-1.7,-4.4,1.8),(-3.65,-1.8,1.25),28),
 (192,(-2.7,-2.25,1.55),(-3.65,-1.8,1.23),36),
 (228,(-.5,-1,1.65),(.6,3,1.4),26),
 (264,(.5,.3,1.65),(.6,4.5,1.4),24),
 (360,(.7,1.8,1.8),(-.2,6.5,1.45),25),
 (480,(1.4,4.2,1.8),(-.4,7.2,1.5),29),
 (600,(.25,4.9,1.6),(-.2,7.05,1.5),32),
 (720,(-.2,5.25,1.5),(-.2,7.05,1.5),32),
]
for f,pos,target,lens in shots:
    cam.location=pos;cam.rotation_euler=(Vector(target)-cam.location).to_track_quat('-Z','Y').to_euler()
    cam.keyframe_insert(data_path='location',frame=f);cam.keyframe_insert(data_path='rotation_euler',frame=f)
    cam.data.lens=lens;cam.data.keyframe_insert(data_path='lens',frame=f)

bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'opening-flight.blend'))
if '--preview' in sys.argv:
    scene.render.resolution_percentage=50
    for f in [1,144,300,432,570,690]:
        scene.frame_set(f);scene.render.filepath=str(OUT/f'preview-{f:04}.png');bpy.ops.render.render(write_still=True)
else:
    scene.render.filepath=str(OUT/'frames'/'frame-')
    (OUT/'frames').mkdir(exist_ok=True)
    bpy.ops.render.render(animation=True)
