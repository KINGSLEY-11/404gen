export default function (THREE) {
  const g = new THREE.Group();
  const paints = [0xe8d5b5, 0x7ba88a, 0x3d4a6b, 0xc26b5a];
  const wall = new THREE.MeshStandardMaterial({ color: paints[Math.floor(Math.random() * paints.length)], roughness: 0.92 });
  wall.name = 'plaster';
  const zinc = new THREE.MeshStandardMaterial({ color: 0x8a9196, roughness: 0.5, metalness: 0.4 });
  zinc.name = 'metal';
  const dark = new THREE.MeshStandardMaterial({ color: 0x2c2620, roughness: 0.8 });
  const warm = new THREE.MeshStandardMaterial({ color: 0xffd19a, emissive: 0xff9a3a, emissiveIntensity: 0.35, roughness: 0.4 });

  const add = (geo, mat, x, y, z, rx = 0, ry = 0, rz = 0) => {
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y, z);
    mesh.rotation.set(rx, ry, rz);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    g.add(mesh);
  };

  add(new THREE.BoxGeometry(8.0, 3.2, 6.2), wall, 0, 1.6, 0);
  add(new THREE.BoxGeometry(8.6, 0.1, 6.8), zinc, 0, 3.30, 0);
  add(new THREE.BoxGeometry(8.2, 0.08, 6.4), zinc, 0, 3.42, -0.08);
  add(new THREE.BoxGeometry(0.1, 0.16, 6.6), zinc, 0, 3.54, 0);

  // verandah slab
  add(new THREE.BoxGeometry(8.0, 0.12, 1.4), wall, 0, 0.18, 3.7);
  add(new THREE.CylinderGeometry(0.08, 0.09, 2.4, 8), wall, -3.4, 1.3, 3.9);
  add(new THREE.CylinderGeometry(0.08, 0.09, 2.4, 8), wall, 3.4, 1.3, 3.9);
  add(new THREE.BoxGeometry(8.0, 0.08, 1.6), zinc, 0, 2.55, 3.8);

  // door + windows with warm interior glow
  add(new THREE.BoxGeometry(1.0, 2.1, 0.08), dark, -1.4, 1.15, 3.14);
  add(new THREE.BoxGeometry(0.9, 0.9, 0.06), warm, 1.6, 1.6, 3.14);
  add(new THREE.BoxGeometry(0.9, 0.9, 0.06), warm, 2.8, 1.6, 3.14);
  add(new THREE.BoxGeometry(0.8, 0.8, 0.06), warm, -3.2, 1.7, 3.14);

  // water tank silhouette on roof
  add(new THREE.CylinderGeometry(0.45, 0.45, 0.8, 10), new THREE.MeshStandardMaterial({ color: 0x3a6ea5, roughness: 0.5, metalness: 0.2 }), 2.4, 4.0, -0.6);

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
