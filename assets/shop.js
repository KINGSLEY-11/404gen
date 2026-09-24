export default function (THREE) {
  const g = new THREE.Group();
  const walls = [
    new THREE.MeshStandardMaterial({ color: 0xe8d5b5, roughness: 0.9 }),
    new THREE.MeshStandardMaterial({ color: 0x7ba88a, roughness: 0.9 }),
    new THREE.MeshStandardMaterial({ color: 0xc26b5a, roughness: 0.9 }),
    new THREE.MeshStandardMaterial({ color: 0xc9a15b, roughness: 0.9 }),
  ];
  walls.forEach((m) => { m.name = 'plaster'; });
  const wall = walls[Math.floor(Math.random() * walls.length)];
  const zinc = new THREE.MeshStandardMaterial({ color: 0x8a9196, roughness: 0.55, metalness: 0.35 });
  zinc.name = 'metal';
  const dark = new THREE.MeshStandardMaterial({ color: 0x2a2420, roughness: 0.8 });
  const wood = new THREE.MeshStandardMaterial({ color: 0x6b4a2b, roughness: 0.85 });
  wood.name = 'timber';
  const fluoro = new THREE.MeshStandardMaterial({ color: 0xc8e4e8, emissive: 0x88a0a8, emissiveIntensity: 0.55, roughness: 0.4 });

  const add = (geo, mat, x, y, z, rx = 0, ry = 0, rz = 0) => {
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y, z);
    mesh.rotation.set(rx, ry, rz);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    g.add(mesh);
    return mesh;
  };

  add(new THREE.BoxGeometry(4.2, 2.6, 3.4), wall, 0, 1.3, 0);
  add(new THREE.BoxGeometry(4.6, 0.08, 3.8), zinc, 0, 2.72, 0);
  add(new THREE.BoxGeometry(4.4, 0.06, 3.6), zinc, 0, 2.82, -0.05);
  // ridge
  add(new THREE.BoxGeometry(0.08, 0.12, 3.7), zinc, 0, 2.92, 0);

  // open shop front
  add(new THREE.BoxGeometry(2.2, 1.6, 0.08), dark, 0, 1.05, 1.72);
  add(new THREE.BoxGeometry(2.05, 0.06, 0.7), wood, 0, 0.28, 1.95);
  add(new THREE.BoxGeometry(2.05, 0.7, 0.6), wood, 0, 0.62, 1.90);

  // awning
  add(new THREE.BoxGeometry(3.2, 0.05, 1.1), zinc, 0, 2.15, 2.05);
  add(new THREE.CylinderGeometry(0.03, 0.03, 1.1, 6), dark, -1.4, 1.55, 2.05);
  add(new THREE.CylinderGeometry(0.03, 0.03, 1.1, 6), dark, 1.4, 1.55, 2.05);

  // fluorescent tube
  add(new THREE.CylinderGeometry(0.03, 0.03, 1.6, 8), fluoro, 0, 2.05, 1.78, 0, 0, Math.PI / 2);

  // signboard
  add(new THREE.BoxGeometry(1.8, 0.42, 0.06), 0xfff ? new THREE.MeshStandardMaterial({ color: 0xf5c400, roughness: 0.5 }) : wall, 0, 2.42, 1.76);
  g.children[g.children.length - 1].material = new THREE.MeshStandardMaterial({ color: 0xf5c400, roughness: 0.5 });

  // side window
  add(new THREE.BoxGeometry(0.7, 0.7, 0.06), dark, -2.11, 1.4, 0.4);

  g.userData.mounts = 'back';

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
