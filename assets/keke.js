export default function (THREE) {
  const g = new THREE.Group();
  const metal = (c, r = 0.45) => {
    const m = new THREE.MeshStandardMaterial({ color: c, roughness: r, metalness: 0.15 });
    m.name = 'metal';
    return m;
  };
  const rubber = new THREE.MeshStandardMaterial({ color: 0x2b2b2b, roughness: 0.95 });
  rubber.name = 'fabric';
  const yellow = metal(0xf5c400, 0.4);
  const green = metal(0x1b6b3a, 0.5);
  const black = metal(0x1a1a1a, 0.6);
  const chrome = metal(0xc8cdd0, 0.25);
  chrome.metalness = 0.7;

  const add = (geo, mat, x, y, z, rx = 0, ry = 0, rz = 0) => {
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y, z);
    mesh.rotation.set(rx, ry, rz);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    g.add(mesh);
    return mesh;
  };

  // rear cabin floor + bench
  add(new THREE.BoxGeometry(1.18, 0.06, 1.22), black, 0, 0.42, -0.42);
  add(new THREE.BoxGeometry(1.18, 0.08, 0.28), yellow, 0, 0.48, -0.95);
  add(new THREE.BoxGeometry(1.14, 0.34, 0.22), green, 0, 0.68, -0.92);

  // cabin sides
  add(new THREE.BoxGeometry(0.06, 0.92, 1.22), yellow, -0.58, 0.90, -0.42);
  add(new THREE.BoxGeometry(0.06, 0.92, 1.22), yellow, 0.58, 0.90, -0.42);
  add(new THREE.BoxGeometry(1.18, 0.92, 0.06), yellow, 0, 0.90, -1.02);
  // open front of cabin
  add(new THREE.BoxGeometry(1.18, 0.08, 1.26), yellow, 0, 1.38, -0.42); // roof
  add(new THREE.BoxGeometry(1.22, 0.05, 1.30), green, 0, 1.43, -0.42);

  // roof rails
  add(new THREE.CylinderGeometry(0.02, 0.02, 1.2, 8), chrome, -0.50, 1.50, -0.42, 0, 0, Math.PI / 2);
  add(new THREE.CylinderGeometry(0.02, 0.02, 1.2, 8), chrome, 0.50, 1.50, -0.42, 0, 0, Math.PI / 2);

  // windshield frame
  add(new THREE.BoxGeometry(1.02, 0.52, 0.04), black, 0, 1.10, 0.20);
  const glass = new THREE.MeshStandardMaterial({ color: 0x8ab0c4, roughness: 0.12, metalness: 0.2, transparent: true, opacity: 0.35 });
  add(new THREE.BoxGeometry(0.94, 0.44, 0.02), glass, 0, 1.10, 0.22);

  // nose / engine cowl
  add(new THREE.BoxGeometry(0.62, 0.38, 0.70), yellow, 0, 0.62, 0.62);
  add(new THREE.BoxGeometry(0.58, 0.16, 0.36), green, 0, 0.78, 0.78);
  add(new THREE.BoxGeometry(0.22, 0.10, 0.08), black, 0, 0.70, 0.98);
  const lamp = new THREE.MeshStandardMaterial({ color: 0xfff2c4, emissive: 0xffd27a, emissiveIntensity: 0.8, roughness: 0.3 });
  add(new THREE.CylinderGeometry(0.07, 0.07, 0.04, 12), lamp, 0, 0.70, 0.99, Math.PI / 2, 0, 0);

  // handlebars
  add(new THREE.CylinderGeometry(0.018, 0.018, 0.62, 8), chrome, 0, 1.08, 0.52, 0, 0, Math.PI / 2);
  add(new THREE.CylinderGeometry(0.025, 0.025, 0.16, 8), black, -0.32, 1.08, 0.52, 0, 0, Math.PI / 2);
  add(new THREE.CylinderGeometry(0.025, 0.025, 0.16, 8), black, 0.32, 1.08, 0.52, 0, 0, Math.PI / 2);

  // seat for driver
  add(new THREE.BoxGeometry(0.38, 0.08, 0.32), black, 0, 0.78, 0.38);

  // rear axle and wheels
  const tyre = (x, z, r = 0.28, w = 0.12) => {
    add(new THREE.CylinderGeometry(r, r, w, 16), rubber, x, r, z, 0, 0, Math.PI / 2);
    add(new THREE.CylinderGeometry(r * 0.45, r * 0.45, w + 0.02, 12), chrome, x, r, z, 0, 0, Math.PI / 2);
  };
  tyre(-0.52, -0.55, 0.30, 0.14);
  tyre(0.52, -0.55, 0.30, 0.14);
  tyre(0, 0.78, 0.26, 0.13);

  // mudguards
  add(new THREE.CylinderGeometry(0.34, 0.34, 0.16, 12, 1, true, 0, Math.PI), yellow, -0.52, 0.30, -0.55, 0, 0, Math.PI / 2);
  add(new THREE.CylinderGeometry(0.34, 0.34, 0.16, 12, 1, true, 0, Math.PI), yellow, 0.52, 0.30, -0.55, 0, 0, Math.PI / 2);

  // number plate
  add(new THREE.BoxGeometry(0.28, 0.10, 0.02), chrome, 0, 0.38, -1.06);

  // bumper bar
  add(new THREE.CylinderGeometry(0.02, 0.02, 0.7, 8), chrome, 0, 0.34, 0.98, 0, 0, Math.PI / 2);

  // center on x/z, sit on y=0, front +Z
  const box = new THREE.Box3(), v = new THREE.Vector3(), m = new THREE.Matrix4(), im = new THREE.Matrix4();
  g.updateMatrixWorld(true);
  g.traverse((n) => {
    const p = n.isMesh && n.geometry.attributes.position; if (!p) return;
    const put = (mat) => { for (let i = 0; i < p.count; i++) box.expandByPoint(v.fromBufferAttribute(p, i).applyMatrix4(mat)); };
    if (n.isInstancedMesh) { for (let c = 0; c < n.count; c++) { n.getMatrixAt(c, im); put(m.multiplyMatrices(n.matrixWorld, im)); } return; }
    put(n.matrixWorld);
  });
  const c = box.getCenter(new THREE.Vector3());
  g.children.forEach((o) => { o.position.x -= c.x; o.position.y -= box.min.y; o.position.z -= c.z; });
  return g;
}
