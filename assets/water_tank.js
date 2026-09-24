export default function (THREE) {
  const g = new THREE.Group();
  const blue = new THREE.MeshStandardMaterial({ color: 0x3a6ea5, roughness: 0.45, metalness: 0.15 });
  blue.name = 'metal';
  const rust = new THREE.MeshStandardMaterial({ color: 0x6a4a32, roughness: 0.8, metalness: 0.2 });

  const stand = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.08, 1.5), rust);
  stand.position.y = 1.6;
  g.add(stand);
  [[-0.6, -0.6], [0.6, -0.6], [-0.6, 0.6], [0.6, 0.6]].forEach(([x, z]) => {
    const l = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 1.6, 6), rust);
    l.position.set(x, 0.8, z);
    l.castShadow = true;
    g.add(l);
  });
  const tank = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 1.3, 14), blue);
  tank.position.y = 2.3;
  tank.castShadow = true;
  g.add(tank);
  const lid = new THREE.Mesh(new THREE.CylinderGeometry(0.72, 0.72, 0.06, 14), blue);
  lid.position.y = 2.98;
  g.add(lid);
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.1, 8), rust);
  cap.position.y = 3.06;
  g.add(cap);

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
