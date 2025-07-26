import * as THREE from 'three';
// ★修正：実際にexportされている関数名に合わせる
import { createRealisticPlumBranch, createSubBranch,
        createTertiaryBranch, createTinyTwig } from './cherry-parts/brunch_export.js';
import { createSakuraFlower, createRealisticSakuraPetal,
        createStamen, createPistil } from './cherry-parts/petals_export.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        initCherryBlossomTree();
    }, 200);
});

function initCherryBlossomTree() {
    const canvas = document.getElementById("cherryBlossomCanvas");
    if (!canvas) {
        console.error('cherryBlossomCanvas が見つかりません');
        return;
    }

    const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true,
        alpha: true
    });
    renderer.setSize(600, 480);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f8ff);

    const camera = new THREE.PerspectiveCamera(60, 600 / 480, 0.1, 1000);
    camera.position.set(1.2, 0.8, 1.5);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 0.5;
    controls.maxDistance = 3.0;
    controls.target.set(0.5, 0.5, 0);

    // ★修正：枝と花を組み合わせる（正しい関数名を使用）
    function createCherryBlossomBranch() {
        const branchGroup = new THREE.Group();
        
        // ★修正：正しい関数名を使用
        const branch = createRealisticPlumBranch();
        branchGroup.add(branch);
        
        // ★修正：節の位置を直接定義（getBranchNodesが無い場合）
        const nodes = [
            { position: new THREE.Vector3(0, 0, 0) },
            { position: new THREE.Vector3(0.4, 0.1, 0.05) },
            { position: new THREE.Vector3(0.7, 0.35, 0) },
            { position: new THREE.Vector3(0.9, 0.7, 0.15) },
            { position: new THREE.Vector3(1.0, 1.1, 0.1) }
        ];
        
        // 各節に花を配置
        for (let i = 1; i < nodes.length - 1; i++) {
            const node = nodes[i];
            
            // 80%の確率で花を咲かせる
            if (Math.random() > 0.2) {
                const flowerCount = 1 + Math.floor(Math.random() * 4); // 1-4個の花
                
                for (let j = 0; j < flowerCount; j++) {
                    const flower = createSakuraFlower(0.8 + Math.random() * 0.4);
                    
                    // 花の位置を節の周辺に配置
                    const angleOffset = (j / flowerCount) * Math.PI * 2 + Math.random() * 0.5;
                    const radiusOffset = 0.03 + Math.random() * 0.02;
                    
                    const flowerOffset = new THREE.Vector3(
                        Math.cos(angleOffset) * radiusOffset,
                        Math.sin(angleOffset) * radiusOffset + Math.random() * 0.02,
                        Math.random() * 0.03 - 0.015
                    );
                    
                    flower.position.copy(node.position).add(flowerOffset);
                    
                    // 花の向きを調整
                    flower.rotation.x += (Math.random() - 0.5) * 0.4;
                    flower.rotation.y = Math.random() * Math.PI * 2;
                    flower.rotation.z += (Math.random() - 0.5) * 0.3;
                    
                    // 花柄を追加
                    const stemGeometry = new THREE.CylinderGeometry(0.002, 0.003, 0.02);
                    const stemMaterial = new THREE.MeshStandardMaterial({ color: 0x90ee90 });
                    const stem = new THREE.Mesh(stemGeometry, stemMaterial);
                    
                    const stemPosition = new THREE.Vector3()
                        .copy(node.position)
                        .add(flowerOffset.clone().multiplyScalar(0.5));
                    stem.position.copy(stemPosition);
                    
                    const stemQuaternion = new THREE.Quaternion();
                    stemQuaternion.setFromUnitVectors(
                        new THREE.Vector3(0, 1, 0), 
                        flowerOffset.clone().normalize()
                    );
                    stem.setRotationFromQuaternion(stemQuaternion);
                    
                    stem.castShadow = true;
                    branchGroup.add(stem);
                    branchGroup.add(flower);
                }
            }

            // ★追加：小枝も生成（importした関数を使用）
            if (Math.random() > 0.6) {
                const subBranch = createSubBranch(node.position, branchGroup, 
                    new THREE.MeshStandardMaterial({
                        color: 0x4a3728,
                        roughness: 0.8,
                        metalness: 0.0
                    }), 
                    i
                );
                // 小枝に花を追加
                if (Math.random() > 0.5) {
                    const subFlower = createSakuraFlower(0.6 + Math.random() * 0.3);
                    const subFlowerOffset = new THREE.Vector3(
                        (Math.random() - 0.5) * 0.1,
                        Math.random() * 0.05 + 0.03,
                        (Math.random() - 0.5) * 0.08
                    );
                    subFlower.position.copy(node.position).add(subFlowerOffset);
                    subFlower.rotation.x = Math.random() * Math.PI * 2;
                    subFlower.rotation.y = Math.random() * Math.PI * 2;
                    subFlower.rotation.z = Math.random() * Math.PI * 2;
                    branchGroup.add(subFlower);
                }
            }
        }
        
        return branchGroup;
    }

    // 桜の花付きの枝を作成してシーンに追加
    const cherryBlossomBranch = createCherryBlossomBranch();
    scene.add(cherryBlossomBranch);

    // 光源設定
    const sunLight = new THREE.DirectionalLight(0xffffff, 1.2);
    sunLight.position.set(3, 5, 2);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.1;
    sunLight.shadow.camera.far = 20;
    sunLight.shadow.camera.left = -3;
    sunLight.shadow.camera.right = 3;
    sunLight.shadow.camera.top = 3;
    sunLight.shadow.camera.bottom = -3;
    scene.add(sunLight);

    const ambientLight = new THREE.AmbientLight(0x87ceeb, 0.4);
    scene.add(ambientLight);

    const fillLight = new THREE.DirectionalLight(0xffc0cb, 0.3);
    fillLight.position.set(-2, 2, -3);
    scene.add(fillLight);

    // アニメーション
    function animate() {
        requestAnimationFrame(animate);

        const t = Date.now() * 0.001;
        const sway = Math.sin(t * 1.5) * 0.005;
        cherryBlossomBranch.rotation.z = sway;
        cherryBlossomBranch.rotation.x = sway * 0.3;
        cherryBlossomBranch.rotation.y += 0.002;

        // ★追加：花びらの微細な動き
        cherryBlossomBranch.children.forEach((child, index) => {
            if (child.type === 'Group') { // 花のグループ
                const wave = Math.sin(t * 3 + index * 0.8) * 0.002;
                child.rotation.z += wave;
                child.rotation.x += wave * 0.5;
            }
        });

        controls.update();
        renderer.render(scene, camera);
    }

    animate();

    window.addEventListener('resize', () => {
        camera.aspect = canvas.width / canvas.height;
        camera.updateProjectionMatrix();
        renderer.setSize(canvas.width, canvas.height);
    });
}
