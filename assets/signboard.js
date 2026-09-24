export default function (THREE) {
  const g = new THREE.Group();
  const wood = new THREE.MeshStandardMaterial({ color: 0x5a3a22, roughness: 0.9 });
  wood.name = 'timber';
  const board = new THREE.MeshStandardMaterial({ color: 0x1b6b3a, roughness: 0.7 });
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 2.4, 8), wood);
  pole.position.y = 1.2;
  pole.castShadow = true;
  g.add(pole);
  const sign = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.7, 0.06), board);
  sign.position.set(0, 2.2, 0);
  sign.castShadow = true;
  g.add(sign);
  const trim = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.06, 0.08), new THREE.MeshStandardMaterial({ color: 0xf5c400, roughness: 0.5 }));
  trim.position.set(0, 2.55, 0);
  g.add(trim);

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
