import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

document.addEventListener('DOMContentLoaded', () => {
    // さらに遅延させて初期化
    setTimeout(() => {
        initKarnation();
    }, 200); // 200ms遅延
});

function initKarnation() {
    const canvas = document.getElementById("karnersionCanvas");
    
    if (!canvas) {
        console.error('karnersionCanvas が見つかりません');
        return;
    }

    // ★修正：WebGLコンテキストの制限を考慮
    const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: false, // アンチエイリアスを無効にしてリソース節約
        alpha: true,
        preserveDrawingBuffer: true
    });
    renderer.setSize(canvas.width, canvas.height);
    renderer.setPixelRatio(window.devicePixelRatio);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xfbe9ea); // 薄いピンク背景

    const camera = new THREE.PerspectiveCamera(45, canvas.width / canvas.height, 0.1, 1000);
    camera.position.set(0, 0.5, 2);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    const carnationGroup = new THREE.Group();
    scene.add(carnationGroup);

    // 🌸 カーネーション風花びらの形を作る
    function createPetalShape(size = 0.1) {
        const shape = new THREE.Shape();
        shape.moveTo(0, 0);
        shape.quadraticCurveTo(size * 0.5, size * 0.2, size, 0);
        shape.quadraticCurveTo(size * 0.8, size * 0.5, size * 0.5, size);
        shape.quadraticCurveTo(0, size * 1.2, -size * 0.5, size);
        shape.quadraticCurveTo(-size * 0.8, size * 0.5, -size, 0);
        shape.quadraticCurveTo(-size * 0.5, size * 0.2, 0, 0); // フリル感
        return shape;
    }

    function createPetalMesh() {
        const extrudeSettings = {
            depth: 0.02,
            bevelEnabled: true,
            bevelThickness: 0.005,
            bevelSize: 0.005,
            bevelSegments: 1
        };

        const shape = createPetalShape();
        const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        const material = new THREE.MeshStandardMaterial({
            color: 0xf06292, // カーネーションっぽい濃いピンク
            roughness: 0.6,
            metalness: 0.1
        });

        return new THREE.Mesh(geometry, material);
    }

    // 花びらを円形に並べる
    const petalCount = 20;
    const radius = 0.3;

    for (let i = 0; i < petalCount; i++) {
        const angle = (i / petalCount) * Math.PI * 2;
        const petal = createPetalMesh();

        petal.position.set(
            Math.cos(angle) * radius,
            0,
            Math.sin(angle) * radius
        );

        petal.lookAt(0, 0, 0); // 花芯を向くようにする
        petal.rotation.x = Math.PI / 2; // 垂直に
        carnationGroup.add(petal);
    }

    // 花の中心（球体）
    const center = new THREE.Mesh(
        new THREE.SphereGeometry(0.05, 16, 16),
        new THREE.MeshStandardMaterial({ color: 0xffc1e3 })
    );
    carnationGroup.add(center);

    // 光源
    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(1, 1, 1);
    scene.add(dirLight);

    const ambLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambLight);

    // アニメーション
    function animate() {
        requestAnimationFrame(animate);
        carnationGroup.rotation.y += 0.003;
        controls.update();
        renderer.render(scene, camera);
    }

    animate();

    // ウィンドウサイズ対応
    window.addEventListener('resize', () => {
        camera.aspect = canvas.width / canvas.height;
        camera.updateProjectionMatrix();
        renderer.setSize(canvas.width, canvas.height);
    });
}
