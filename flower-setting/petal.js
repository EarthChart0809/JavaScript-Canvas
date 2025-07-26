import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

document.addEventListener('DOMContentLoaded', () => {
    // 最初に初期化
    setTimeout(() => {
        initPetal();
    }, 50); // 50ms遅延
});

function initPetal() {
    const canvas = document.getElementById("petalCanvas");
    
    if (!canvas) {
        console.error('petalCanvas が見つかりません');
        return;
    }

    // シンプルな設定でリソース使用量を抑制
    const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: false,
        alpha: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf3f9f1); // 夜空のような背景

    // ★修正：canvasのアスペクト比を使用
    const camera = new THREE.PerspectiveCamera(75, 800 / 600, 0.1, 1000);
    camera.position.set(0, 0, 1); // ★修正：より適切な位置

    // OrbitControlsを追加
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // 桜の花びらグループ
    const sakuraGroup = new THREE.Group();
    scene.add(sakuraGroup);

     // 花びら生成関数
function createSakuraPetal(size, color, position) {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.quadraticCurveTo(size * 0.5, size * 0.2, size, size * 0.6);
    shape.quadraticCurveTo(size * 0.9, size * 1.0, size * 0.5, size * 1.2);
    shape.quadraticCurveTo(size * 0.2, size * 1.3, 0, size * 1.0);
    shape.quadraticCurveTo(-size * 0.2, size * 0.7, -size * 0.1, size * 0.3);
    shape.quadraticCurveTo(-size * 0.05, size * 0.1, 0, 0);

    const extrudeSettings = {
      depth: 0.01,
      bevelEnabled: true,
      bevelThickness: 0.005,
      bevelSize: 0.005,
      bevelSegments: 2
    };

    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geometry.translate(-size / 2, -size / 2, 0); // 中心を原点に

    // ジオメトリに手動で湾曲を加える
    const positionAttribute = geometry.attributes.position;
    const vertex = new THREE.Vector3();
    for (let i = 0; i < positionAttribute.count; i++) {
        vertex.fromBufferAttribute(positionAttribute, i);

    // 中心からの距離に応じて湾曲（Z方向に曲げる）
    const dist = Math.sqrt(vertex.x ** 2 + vertex.y ** 2);
    const curveStrength = 0.1; // 湾曲の強さ（調整可能）
    vertex.z = Math.sin(dist * Math.PI) * curveStrength;

    positionAttribute.setXYZ(i, vertex.x, vertex.y, vertex.z);
    }
    positionAttribute.needsUpdate = true;
    geometry.computeVertexNormals(); // 光の当たり方を再計算
    const material = new THREE.MeshStandardMaterial({
      color: color,
      transparent: true,
      opacity: 0.9
    });

    const petal = new THREE.Mesh(geometry, material);
    petal.position.copy(position);

    return petal;
}

// 花びらを1つだけ作成
const petal = createSakuraPetal(0.5, 0xff69b4, new THREE.Vector3(0, 0, 0));
petal.rotation.x = Math.PI / 2;
scene.add(petal);

// ライト
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(2, 1, 1);
scene.add(light);

const ambient = new THREE.AmbientLight(0x404040, 0.5);
scene.add(ambient);

// 描画ループ
function animate() {
requestAnimationFrame(animate);
petal.rotation.z += 0.01;
controls.update();
renderer.render(scene, camera);
}

animate();

    // 固定サイズなので変更しない
    camera.aspect = 250 / 200;
    renderer.setSize(300, 300, false); // 固定サイズに設定

canvas.width = 480;
canvas.height = 360;
canvas.style.width = '480px';
canvas.style.height = '360px';
}