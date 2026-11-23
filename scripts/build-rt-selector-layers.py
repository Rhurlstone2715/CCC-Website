"""Deterministic palette conversion and clipping of the existing customer-approved PNG.
No generation, tracing, inpainting, background filling or invented replacement pixels.
Run: python3 scripts/build-rt-selector-layers.py
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageChops
import numpy as np
import hashlib
root=Path(__file__).resolve().parents[1]
source_path=root/'public/assets/catalog/rt890e-selector-cutout.png'
assert hashlib.sha256(source_path.read_bytes()).hexdigest()=='efe0e60584a97e74d75784bcfd52b43801ffbe101a02f5cfc55e28e5cb9cb718', 'Source changed: review clipping geometry before rebuilding.'
source=Image.open(source_path).convert('RGBA')
assert source.size==(1254,1254)
a=np.array(source);rgb=a[:,:,:3].astype(float);mx=rgb.max(axis=2);mn=rgb.min(axis=2)
# Target yellow/orange paint only; retain teal glazing, tyres, metal and safety stripes.
paint=(rgb[:,:,0]>100)&(rgb[:,:,1]>55)&(rgb[:,:,2]<rgb[:,:,0]*.65)&(rgb[:,:,1]>rgb[:,:,2]*1.25)&(rgb[:,:,0]>rgb[:,:,1]*.90)&((mx-mn)>50)
grey=a.copy();tone=np.rint(70+.70*mx).clip(0,255).astype('uint8')
for c in range(3):grey[:,:,c][paint]=tone[paint]
assert np.array_equal(a[:,:,3],grey[:,:,3])
assert np.array_equal(a[:,:,:3][~paint],grey[:,:,:3][~paint])
variants={'yellow':source,'grey-white':Image.fromarray(grey)}
polygons={
 'body':[(0,970),(625,970),(625,820),(643,797),(800,777),(815,860),(930,860),(930,730),(1254,730),(1254,1254),(0,1254)],
 'boom':[(58,124),(170,56),(236,146),(952,823),(946,874),(817,874),(778,806),(545,603),(512,606),(490,590),(480,534),(163,235),(159,210),(85,201)],
 'cylinder':[(503,579),(525,570),(581,685),(594,690),(657,857),(643,925),(604,828),(553,706),(552,692)],
 'hook':[(76,198),(148,198),(148,480),(76,480)]}
masks={}
for name,points in polygons.items():
 mask=Image.new('L',source.size);ImageDraw.Draw(mask).polygon(points,fill=255);masks[name]=mask
# Overlap prevents seams; the lower boom occludes the telescoping upper piece.
upper=Image.new('L',source.size);ImageDraw.Draw(upper).polygon([(0,0),(1180,0),(0,1180)],fill=255)
base=Image.new('L',source.size);ImageDraw.Draw(base).polygon([(0,1050),(1050,0),(1254,0),(1254,1254),(0,1254)],fill=255)
masks['boom-upper']=ImageChops.multiply(masks['boom'],upper)
masks['boom-base']=ImageChops.multiply(masks['boom'],base)
out=root/'public/assets/catalog/rt-selector';out.mkdir(exist_ok=True)
for colour,image in variants.items():
 if colour=='grey-white':image.save(out/'grey-white-full.png',optimize=True)
 for part in ['body','boom-upper','boom-base','cylinder','hook']:
  layer=image.copy();layer.putalpha(ImageChops.multiply(image.getchannel('A'),masks[part]))
  pixels=np.array(layer);pixels[:,:,:3][pixels[:,:,3]==0]=0 # lossless removal of invisible RGB for smaller downloads
  Image.fromarray(pixels).save(out/f'{colour}-{part}.png',optimize=True)
print('Created 10 clipped PNG layers and grey-white variant. Alpha and non-paint pixels preserved.')
