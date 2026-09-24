export default function (THREE) {
  const g = new THREE.Group();
  const red = new THREE.MeshStandardMaterial({ color: 0xb33a2b, roughness: 0.45, metalness: 0.2 });
  red.name = 'metal';
  const black = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.7 });
  const chrome = new THREE.MeshStandardMaterial({ color: 0xc8cdd0, roughness: 0.3, metalness: 0.6 });

  const add = (geo, mat, x, y, z) => {
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    g.add(mesh);
  };
  add(new THREE.BoxGeometry(1.4, 0.7, 0.7), red, 0, 0.45, 0);
  add(new THREE.BoxGeometry(0.5, 0.45, 0.55), black, 0.55, 0.52, 0);
  add(new THREE.CylinderGeometry(0.12, 0.12, 0.18, 10), chrome, -0.5, 0.92, 0);
  add(new THREE.BoxGeometry(0.16, 0.08, 0.22), chrome, 0.2, 0.84, 0.28);
  add(new THREE.CylinderGeometry(0.04, 0.04, 0.3, 8), black, -0.2, 0.22, 0.38);
  add(new THREE.CylinderGeometry(0.04, 0.04, 0.3, 8), black, 0.4, 0.22, 0.38);
  add(new THREE.CylinderGeometry(0.04, 0.04, 0.3, 8), black, -0.2, 0.22, -0.38);
  add(new THREE.CylinderGeometry(0.04, 0.04, 0.3, 8), black, 0.4, 0.22, -0.38);

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
