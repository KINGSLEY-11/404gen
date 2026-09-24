export default function (THREE) {
  const g = new THREE.Group();
  const wood = new THREE.MeshStandardMaterial({ color: 0x5a3a22, roughness: 0.9 });
  wood.name = 'timber';
  const metal = new THREE.MeshStandardMaterial({ color: 0x6a6e72, roughness: 0.4, metalness: 0.5 });
  metal.name = 'metal';
  const coal = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 1, emissive: 0x3a1208, emissiveIntensity: 0.4 });
  const meat = new THREE.MeshStandardMaterial({ color: 0x6b2a18, roughness: 0.6 });
  const zinc = new THREE.MeshStandardMaterial({ color: 0x8a9196, roughness: 0.5, metalness: 0.3 });

  const add = (geo, mat, x, y, z) => {
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    g.add(mesh);
  };

  add(new THREE.BoxGeometry(1.8, 0.08, 1.1), wood, 0, 0.92, 0);
  add(new THREE.BoxGeometry(0.08, 0.92, 0.08), wood, -0.8, 0.46, -0.45);
  add(new THREE.BoxGeometry(0.08, 0.92, 0.08), wood, 0.8, 0.46, -0.45);
  add(new THREE.BoxGeometry(0.08, 0.92, 0.08), wood, -0.8, 0.46, 0.45);
  add(new THREE.BoxGeometry(0.08, 0.92, 0.08), wood, 0.8, 0.46, 0.45);
  add(new THREE.BoxGeometry(1.2, 0.12, 0.5), metal, 0, 0.98, 0.05);
  add(new THREE.BoxGeometry(1.05, 0.06, 0.36), coal, 0, 1.06, 0.05);
  for (let i = 0; i < 5; i++) add(new THREE.CylinderGeometry(0.025, 0.03, 0.22, 6), meat, -0.4 + i * 0.2, 1.20, 0.05);
  add(new THREE.BoxGeometry(2.0, 0.04, 1.3), zinc, 0, 2.15, 0);
  add(new THREE.CylinderGeometry(0.025, 0.025, 1.2, 6), metal, -0.85, 1.55, -0.5);
  add(new THREE.CylinderGeometry(0.025, 0.025, 1.2, 6), metal, 0.85, 1.55, -0.5);
  add(new THREE.CylinderGeometry(0.025, 0.025, 1.2, 6), metal, -0.85, 1.55, 0.5);
  add(new THREE.CylinderGeometry(0.025, 0.025, 1.2, 6), metal, 0.85, 1.55, 0.5);

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
