export default function (THREE) {
  const g = new THREE.Group();
  const hide = new THREE.MeshStandardMaterial({ color: 0x7a4a2a, roughness: 0.9 });
  hide.name = 'fabric';
  const dark = new THREE.MeshStandardMaterial({ color: 0x3a2416, roughness: 0.9 });
  const horn = new THREE.MeshStandardMaterial({ color: 0xd8c7a0, roughness: 0.5 });

  const add = (geo, mat, x, y, z, rx = 0, ry = 0, rz = 0) => {
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y, z);
    mesh.rotation.set(rx, ry, rz);
    mesh.castShadow = true;
    g.add(mesh);
    return mesh;
  };

  add(new THREE.BoxGeometry(0.22, 0.28, 0.55), hide, 0, 0.46, 0);
  add(new THREE.BoxGeometry(0.18, 0.18, 0.22), hide, 0, 0.52, 0.34);
  add(new THREE.CylinderGeometry(0.06, 0.08, 0.16, 8), hide, 0, 0.46, 0.46, Math.PI / 2);
  add(new THREE.BoxGeometry(0.08, 0.10, 0.10), dark, 0, 0.50, 0.54);
  add(new THREE.CylinderGeometry(0.012, 0.03, 0.14, 6), horn, -0.05, 0.66, 0.36, 0.4, 0, 0.3);
  add(new THREE.CylinderGeometry(0.012, 0.03, 0.14, 6), horn, 0.05, 0.66, 0.36, 0.4, 0, -0.3);
  add(new THREE.CylinderGeometry(0.015, 0.02, 0.18, 6), hide, 0, 0.42, -0.32, 1.1, 0, 0);
  // legs
  [[-0.07, 0.18], [0.07, 0.18], [-0.07, -0.18], [0.07, -0.18]].forEach(([x, z]) => {
    add(new THREE.CylinderGeometry(0.025, 0.03, 0.32, 6), dark, x, 0.16, z);
  });

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
