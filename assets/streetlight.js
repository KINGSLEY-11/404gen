export default function (THREE) {
  const g = new THREE.Group();
  const metal = new THREE.MeshStandardMaterial({ color: 0x4a4e52, roughness: 0.45, metalness: 0.5 });
  metal.name = 'metal';
  const sodium = new THREE.MeshStandardMaterial({ color: 0xffb347, emissive: 0xff9a2b, emissiveIntensity: 1.2, roughness: 0.3 });

  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 6.4, 8), metal);
  pole.position.y = 3.2;
  pole.castShadow = true;
  g.add(pole);
  const arm = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.07, 0.07), metal);
  arm.position.set(0.55, 6.35, 0);
  g.add(arm);
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.12, 0.28), metal);
  head.position.set(1.15, 6.22, 0);
  g.add(head);
  const bulb = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.04, 0.2), sodium);
  bulb.position.set(1.15, 6.14, 0);
  g.add(bulb);

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
