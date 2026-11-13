// Document-photo framing: every portrait gets an ID-style crop of the same image, the frame is always fully
// covered, and the crop is a real change of picture (so the booth and the document are not the same pixels).
import test from 'node:test';
import assert from 'node:assert/strict';
import { documentPhotoFrame } from '../../src/js/services/portraits.js';
import { PORTRAIT_RIGS } from '../../src/data/portrait-rigs.js';
import { TRAVELER_POOL } from '../../src/data/travelers.js';

test('every traveller portrait has a rig and a covering ID frame', () => {
  for (const t of TRAVELER_POOL) {
    const rig = PORTRAIT_RIGS[t.id]; assert.ok(rig, `${t.id} has a rig`);
    const f = documentPhotoFrame(rig);
    assert.ok(f.zoom >= 1.25 && f.zoom <= 1.6, `${t.id} zoom ${f.zoom}`);
    // image edges after translate(tx,ty) scale(zoom) about (x,y), in frame units (0..1); 0.002 = rounding
    const left = f.x - f.zoom * f.x + f.tx, right = f.x + f.zoom * (1 - f.x) + f.tx;
    const top = f.y - f.zoom * f.y + f.ty, bottom = f.y + f.zoom * (1 - f.y) + f.ty;
    assert.ok(left <= 0.002 && right >= 0.998 && top <= 0.002 && bottom >= 0.998, `${t.id} leaves the frame uncovered`);
    // the eyes stay inside the frame
    assert.ok(f.x + f.tx > 0.2 && f.x + f.tx < 0.8 && f.y + f.ty > 0.2 && f.y + f.ty < 0.7, `${t.id} eyes out of frame`);
  }
});

test('a centred face lands on the ID eye line; a missing rig falls back to a fixed frame', () => {
  const f = documentPhotoFrame({ eyeL: { x0: 0.36, x1: 0.46, cy: 0.42 }, eyeR: { x0: 0.59, x1: 0.69, cy: 0.42 } });
  assert.equal(f.zoom, 1.435); assert.ok(Math.abs(f.x + f.tx - 0.5) < 0.03); assert.equal(f.ty, 0);
  assert.deepEqual(documentPhotoFrame(null), { zoom: 1.3, x: 0.5, y: 0.4, tx: 0, ty: 0.02 });
  assert.deepEqual(documentPhotoFrame({}), documentPhotoFrame(undefined));
});
