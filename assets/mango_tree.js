export default function (THREE) {
  const g = new THREE.Group();
  const bark = new THREE.MeshStandardMaterial({ color: 0x5a3a22, roughness: 0.95 });
  bark.name = 'timber';
  const leaf = new THREE.MeshStandardMaterial({ color: 0x3d5c32, roughness: 0.85 });
  leaf.name = 'foliage';
  const fruit = new THREE.MeshStandardMaterial({ color: 0xe07a2f, roughness: 0.5 });

  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.28, 3.2, 8), bark);
  trunk.position.y = 1.6;
  trunk.castShadow = true;
  g.add(trunk);
  const fork = new THREE.Mesh(new THREE.CylinderGeometry(0.10, 0.16, 1.8, 8), bark);
  fork.position.set(0.35, 3.4, 0.1);
  fork.rotation.z = -0.45;
  fork.castShadow = true;
  g.add(fork);

  const canopy = (x, y, z, s) => {
    const m = new THREE.Mesh(new THREE.SphereGeometry(s, 10, 8), leaf);
    m.position.set(x, y, z);
    m.castShadow = true;
    g.add(m);
  };
  canopy(0.1, 5.4, 0, 2.1);
  canopy(-1.1, 4.8, 0.4, 1.5);
  canopy(1.3, 5.0, -0.3, 1.6);
  canopy(0.2, 6.2, 0.2, 1.3);

  for (let i = 0; i < 7; i++) {
    const f = new THREE.Mesh(new THREE.SphereGeometry(0.07, 6, 5), fruit);
    const a = i * 0.9;
    f.position.set(Math.cos(a) * 1.3, 4.6 + (i % 3) * 0.4, Math.sin(a) * 1.2);
    g.add(f);
  }

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
