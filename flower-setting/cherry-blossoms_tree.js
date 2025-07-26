import * as THREE from 'three';
// ★修正：実際にexportされている関数名に合わせる
import { createRealisticPlumBranch, createSubBranch, getBranchNodes, createTertiaryBranch, createTinyTwig } from './cherry-parts/brunch_export.js';
import { createSakuraFlower } from './cherry-parts/petals_export.js';
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
    scene.background = new THREE.Color(0xf3f9f1);

    const camera = new THREE.PerspectiveCamera(60, 600 / 480, 0.1, 1000);
    camera.position.set(1.2, 0.8, 1.5);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 0.5;
    controls.maxDistance = 3.0;
    controls.target.set(0.5, 0.5, 0);

    // ★修正：新しいインポート関数を活用した枝と花の組み合わせ
    function createCherryBlossomBranch() {
        const branchGroup = new THREE.Group();
        
        // ★修正：メインの枝を作成
        const mainBranch = createRealisticPlumBranch();
        branchGroup.add(mainBranch);
        
        // ★修正：getBranchNodes関数を使用して節の位置を取得
        let nodes;
        try {
            nodes = getBranchNodes(mainBranch); // インポートした関数を使用
            console.log('✅ getBranchNodes から節を取得:', nodes.length, '個');
        } catch (error) {
            console.warn('⚠️ getBranchNodes でエラー、フォールバック使用:', error);
        }
        
        // 各節に花を配置
        for (let i = 1; i < nodes.length - 1; i++) {
            const node = nodes[i];
            
            // 80%の確率で花を咲かせる
            if (Math.random() > 0.2) {
                const flowerCount = 1 + Math.floor(Math.random() * 3); // 1-3個の花
                
                for (let j = 0; j < flowerCount; j++) {
                    const flower = createSakuraFlower(0.7 + Math.random() * 0.4);
                    
                    // 花の位置を節の周辺に配置
                    const angleOffset = (j / flowerCount) * Math.PI * 2 + Math.random() * 0.5;
                    const radiusOffset = 0.02 + Math.random() * 0.015;
                    
                    const flowerOffset = new THREE.Vector3(
                        Math.cos(angleOffset) * radiusOffset,
                        Math.sin(angleOffset) * radiusOffset + Math.random() * 0.015,
                        Math.random() * 0.025 - 0.0125
                    );
                    
                    flower.position.copy(node.position).add(flowerOffset);
                    
                    // 花の向きを調整
                    flower.rotation.x += (Math.random() - 0.5) * 0.3;
                    flower.rotation.y = Math.random() * Math.PI * 2;
                    flower.rotation.z += (Math.random() - 0.5) * 0.25;
                    
                    branchGroup.add(flower);
                }
            }

            // ★修正：createSubBranch関数を使用
            if (Math.random() > 0.6 && i > 1 && i < nodes.length - 2) {
                try {
                    const subBranch = createSubBranch(
                        node.position, 
                        branchGroup, 
                        new THREE.MeshStandardMaterial({
                            color: 0x4a3728,
                            roughness: 0.8,
                            metalness: 0.0
                        }), 
                        i
                    );
                    
                    // ★修正：subBranchの戻り値をチェックして使用
                    if (subBranch && subBranch.isObject3D) {
                        branchGroup.add(subBranch);
                        console.log(`✅ サブブランチ ${i} を追加`);
                        
                        // 小枝に花を追加
                        if (Math.random() > 0.4) {
                            const subFlower = createSakuraFlower(0.5 + Math.random() * 0.3);
                            if (subFlower && subFlower.isObject3D) {
                                const subFlowerOffset = new THREE.Vector3(
                                    (Math.random() - 0.5) * 0.08,
                                    Math.random() * 0.04 + 0.025,
                                    (Math.random() - 0.5) * 0.06
                                );
                                subFlower.position.copy(node.position).add(subFlowerOffset);
                                subFlower.rotation.x = Math.random() * Math.PI * 2;
                                subFlower.rotation.y = Math.random() * Math.PI * 2;
                                subFlower.rotation.z = Math.random() * Math.PI * 2;
                                branchGroup.add(subFlower);
                                console.log(`✅ サブ花 ${i} を追加`);
                            }
                        }
                    } else {
                        console.warn(`⚠️ createSubBranch ${i} が無効な戻り値:`, subBranch);
                    }
                    
                } catch (error) {
                    console.warn(`⚠️ サブブランチ ${i} の作成に失敗:`, error);
                }
            }

            // ★新規：createTertiaryBranch関数を使用（三次枝の生成）
            if (Math.random() > 0.7 && i > 2 && i < nodes.length - 1) {
                try {
                    const tertiaryBranch = createTertiaryBranch(
                        node.position,
                        new THREE.Vector3(
                            (Math.random() - 0.5) * 0.3,
                            Math.random() * 0.15 + 0.05,
                            (Math.random() - 0.5) * 0.2
                        ),
                        0.8 + Math.random() * 0.4 // スケール
                    );
                    
                    branchGroup.add(tertiaryBranch);
                    
                    // 三次枝にも花を追加
                    if (Math.random() > 0.5) {
                        const tertiaryFlower = createSakuraFlower(0.4 + Math.random() * 0.2);
                        const tertiaryFlowerOffset = new THREE.Vector3(
                            (Math.random() - 0.5) * 0.06,
                            Math.random() * 0.03 + 0.02,
                            (Math.random() - 0.5) * 0.04
                        );
                        tertiaryFlower.position.copy(node.position).add(tertiaryFlowerOffset);
                        tertiaryFlower.rotation.x = Math.random() * Math.PI * 2;
                        tertiaryFlower.rotation.y = Math.random() * Math.PI * 2;
                        tertiaryFlower.rotation.z = Math.random() * Math.PI * 2;
                        branchGroup.add(tertiaryFlower);
                    }
                    
                    console.log(`✅ 三次枝 ${i} を作成`);
                } catch (error) {
                    console.warn(`⚠️ 三次枝 ${i} の作成に失敗:`, error);
                }
            }

            // ★新規：createTinyTwig関数を使用（小さな枝の生成）
            if (Math.random() > 0.8 && i > 1) {
                try {
                    const tinyTwig = createTinyTwig(
                        node.position,
                        new THREE.Vector3(
                            (Math.random() - 0.5) * 0.15,
                            Math.random() * 0.08 + 0.02,
                            (Math.random() - 0.5) * 0.12
                        )
                    );
                    
                    branchGroup.add(tinyTwig);
                    
                    // 小枝にも小さな花を追加
                    if (Math.random() > 0.6) {
                        const tinyFlower = createSakuraFlower(0.3 + Math.random() * 0.15);
                        const tinyFlowerOffset = new THREE.Vector3(
                            (Math.random() - 0.5) * 0.04,
                            Math.random() * 0.02 + 0.015,
                            (Math.random() - 0.5) * 0.03
                        );
                        tinyFlower.position.copy(node.position).add(tinyFlowerOffset);
                        tinyFlower.rotation.x = Math.random() * Math.PI * 2;
                        tinyFlower.rotation.y = Math.random() * Math.PI * 2;
                        tinyFlower.rotation.z = Math.random() * Math.PI * 2;
                        branchGroup.add(tinyFlower);
                    }
                    
                    console.log(`✅ 小枝 ${i} を作成`);
                } catch (error) {
                    console.warn(`⚠️ 小枝 ${i} の作成に失敗:`, error);
                }
            }
        }
        
        console.log(`✅ 桜の枝作成完了: ${branchGroup.children.length} 個の要素`);
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

    // ★修正：より詳細なアニメーション
    function animate() {
        requestAnimationFrame(animate);

        const t = Date.now() * 0.001;
        const sway = Math.sin(t * 1.2) * 0.008;
        cherryBlossomBranch.rotation.z = sway;
        cherryBlossomBranch.rotation.x = sway * 0.4;
        cherryBlossomBranch.rotation.y += 0.001;

        // ★修正：花びらと枝の微細な動き
        cherryBlossomBranch.children.forEach((child, index) => {
            if (child.type === 'Group') { // 花のグループ
                const wave = Math.sin(t * 2.5 + index * 0.7) * 0.003;
                child.rotation.z += wave;
                child.rotation.x += wave * 0.6;
            } else if (child.type === 'Mesh' && child.geometry.type === 'CylinderGeometry') {
                // 枝の微細な揺れ
                const branchWave = Math.sin(t * 1.8 + index * 0.5) * 0.002;
                child.rotation.z += branchWave;
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
