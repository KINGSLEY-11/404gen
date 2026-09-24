export default function (THREE) {
  const g = new THREE.Group();
  const skin = new THREE.MeshStandardMaterial({ color: 0x6b3a24, roughness: 0.7 });
  skin.name = 'fabric';
  const clothA = new THREE.MeshStandardMaterial({ color: 0x2e5a8c, roughness: 0.8 });
  clothA.name = 'fabric';
  const clothB = new THREE.MeshStandardMaterial({ color: 0xd4a017, roughness: 0.8 });
  clothB.name = 'fabric';
  const dark = new THREE.MeshStandardMaterial({ color: 0x2a221c, roughness: 0.85 });

  const add = (geo, mat, x, y, z, sx = 1, sy = 1, sz = 1) => {
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y, z);
    mesh.scale.set(sx, sy, sz);
    mesh.castShadow = true;
    g.add(mesh);
    return mesh;
  };

  // legs
  add(new THREE.CylinderGeometry(0.07, 0.08, 0.62, 8), dark, -0.09, 0.31, 0);
  add(new THREE.CylinderGeometry(0.07, 0.08, 0.62, 8), dark, 0.09, 0.31, 0);
  // torso wrapper
  add(new THREE.CylinderGeometry(0.16, 0.18, 0.52, 10), clothA, 0, 0.90, 0);
  add(new THREE.BoxGeometry(0.34, 0.08, 0.22), clothB, 0, 0.78, 0.02);
  // arms
  add(new THREE.CylinderGeometry(0.045, 0.05, 0.48, 8), skin, -0.24, 0.92, 0.02);
  add(new THREE.CylinderGeometry(0.045, 0.05, 0.48, 8), skin, 0.24, 0.92, 0.02);
  // raised hailing arm
  const hail = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.05, 0.52, 8), skin);
  hail.position.set(0.22, 1.28, 0.08);
  hail.rotation.z = -0.7;
  hail.castShadow = true;
  g.add(hail);
  // head
  add(new THREE.SphereGeometry(0.13, 10, 8), skin, 0, 1.32, 0);
  // short hair
  add(new THREE.SphereGeometry(0.135, 10, 8), dark, 0, 1.36, -0.01, 1, 0.6, 1);

  const box = new THREE.Box3(), v = new THREE.Vector3();
  g.updateMatrixWorld(true);
  g.traverse((n) => {
    const p = n.isMesh && n.geometry.attributes.position; if (!p) return;
    for (let i = 0; i < p.count; i++) box.expandByPoint(v.fromBufferAttribute(p, i).applyMatrix4(n.matrixWorld));
  });
  const c = box.getCenter(new THREE.Vector3());
  g.children.forEach((o) => { o.position.x -= c.x; o.position.y -= box.min.y; o.position.z -= c.z; });
  return g;
}
