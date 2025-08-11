import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { createRealisticSakuraPetal } from './cherry-parts/petals_export.js';

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        initSakura();
    }, 200);
});

function initSakura() {
    const canvas = document.getElementById("sakuraCanvas");
    
    if (!canvas) {
        console.error('sakuraCanvas が見つかりません');
        return;
    }

    const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true,
        alpha: true,
        preserveDrawingBuffer: true,
        powerPreference: "high-performance"
    });

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf3f9f1);
    
    const camera = new THREE.PerspectiveCamera(
        60, canvas.width / canvas.height, 0.1, 1000
    );
    camera.position.set(0, 0.5, 1.5);

    renderer.setSize(canvas.width, canvas.height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCSShadowMap;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // 雄蕊を作成する関数（1つだけ）
    function createStamen(count = 15, sizeScale = 2.0) { // ★サイズパラメータ追加
        const stamenGroup = new THREE.Group();
        
        for (let i = 0; i < count; i++) {
            // ★雄蕊の軸のサイズ調整
            const stalkGeometry = new THREE.CylinderGeometry(
                0.002 * sizeScale,  // ★上端の半径
                0.003 * sizeScale,  // ★下端の半径  
                0.08 * sizeScale    // ★高さ
            );
            const stalkMaterial = new THREE.MeshStandardMaterial({ 
                color: 0x90ee90 
            });
            const stalk = new THREE.Mesh(stalkGeometry, stalkMaterial);
            
            // ★葯（やく）のサイズ調整
            const antherGeometry = new THREE.SphereGeometry(
                0.008 * sizeScale,  // ★葯の半径
                8, 8
            );
            const antherMaterial = new THREE.MeshStandardMaterial({ 
                color: 0xffd700 
            });
            const anther = new THREE.Mesh(antherGeometry, antherMaterial);
            anther.position.y = 0.04 * sizeScale; // ★葯の位置も調整
            
            const angle = (i / count) * Math.PI * 2;
            const radius = (0.03 + Math.random() * 0.02) * sizeScale; // ★配置半径も調整

            const stamenUnit = new THREE.Group();
            stamenUnit.add(stalk);
            stamenUnit.add(anther);

            stamenUnit.position.x = Math.cos(angle) * radius;
            stamenUnit.position.y = Math.sin(angle) * radius;
            stamenUnit.position.z = (0.005 + Math.random() * 0.005) * sizeScale; // ★Z位置も調整

            // 向きは変更なし
            const direction = new THREE.Vector3(
                Math.cos(angle),
                Math.sin(angle),
                0.8
            ).normalize();

            const quaternion = new THREE.Quaternion();
            quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);
            stamenUnit.setRotationFromQuaternion(quaternion);

            stamenUnit.rotation.x += (Math.random() - 0.5) * 0.2;
            stamenUnit.rotation.y += (Math.random() - 0.5) * 0.2;

            stamenGroup.add(stamenUnit);
        }
        
        return stamenGroup;
    }

    // 雌蕊を作成する関数（サイズ調整可能版）
    function createPistil(sizeScale = 2.0) { // ★サイズパラメータ追加
        // ★雌蕊の軸のサイズ調整
        const pistilGeometry = new THREE.CylinderGeometry(
            0.004 * sizeScale,  // ★上端の半径
            0.004 * sizeScale,  // ★下端の半径
            0.06 * sizeScale    // ★高さ
        );
        const pistilMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x98fb98 
        });
        const pistil = new THREE.Mesh(pistilGeometry, pistilMaterial);
        
        // ★雌蕊の先端（柱頭）のサイズ調整
        const stigmaGeometry = new THREE.SphereGeometry(
            0.006 * sizeScale,  // ★柱頭の半径
            8, 8
        );
        const stigmaMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xffffff 
        });
        const stigma = new THREE.Mesh(stigmaGeometry, stigmaMaterial);
        stigma.position.y = 0.035 * sizeScale; // ★柱頭の位置も調整
        
        const pistilGroup = new THREE.Group();
        pistilGroup.add(pistil);
        pistilGroup.add(stigma);

        return pistilGroup;
    }

    // ★修正：インポートした花びら1枚で完全な桜の花を作成
    function createCompleteSakuraFlower(stamenScale = 2.5, pistilScale = 2.5, calyxScale = 2.5) {
        const completeFlower = new THREE.Group();
        
        try {
            console.log('インポートした花びら1枚で桜の花を作成中...');
            
            // ★修正：花びら1枚を5回配置
            for (let i = 0; i < 5; i++) {
                const angle = (i / 5) * Math.PI * 2;
                
                // ★重要：花びら1枚だけを作成する関数を使用
                const petal = createRealisticSakuraPetal(0.65); // 花びら1枚
                
                // 花びらの位置と回転を調整
                const radius = 0.00; // 中心からの距離を調整
                petal.position.x = Math.cos(angle) * radius;
                petal.position.y = Math.sin(angle) * radius;
                petal.position.z = Math.sin(i) * 0.005;
                
                // 花びらの向きを調整
                petal.rotation.z = angle; // 放射状に配置
                petal.rotation.x = -Math.PI / 2 + Math.sin(i) * 0.05;
                petal.rotation.y = (Math.random() - 0.5) * 0.1;
                
                completeFlower.add(petal);
            }
            
            console.log('✅ 花びら5枚の配置完了');
            
        } catch (error) {
            console.error('❌ インポートした花びらの使用に失敗:', error);
            
            // ★フォールバック：シンプルな花びらを5枚作成
            console.log('🔄 フォールバック版の花びらを作成中...');
            
            for (let i = 0; i < 5; i++) {
                const angle = (i / 5) * Math.PI * 2;
                
                const petalGeometry = new THREE.PlaneGeometry(0.15, 0.25);
                const petalMaterial = new THREE.MeshStandardMaterial({
                    color: 0xff69b4,
                    transparent: true,
                    opacity: 0.9,
                    side: THREE.DoubleSide
                });
                
                const petal = new THREE.Mesh(petalGeometry, petalMaterial);
                
                petal.position.x = Math.cos(angle) * 0.08;
                petal.position.y = Math.sin(angle) * 0.08;
                petal.position.z = 0;
                
                petal.rotation.z = angle;
                petal.rotation.x = -Math.PI / 2;
                
                completeFlower.add(petal);
            }
        }
        
        // ★重要：雄蕊、雌蕊、がくは1セットだけ追加
        
        // 雄蕊を1セット追加
        const stamens = createStamen(15, stamenScale);
        stamens.position.set(0, 0, 0.00);
        completeFlower.add(stamens);
        stamens.rotation.x = -Math.PI / 2; // 雄蕊を下向きに配置
        
        // 雌蕊を1つ追加
        const pistil = createPistil(pistilScale);
        pistil.position.set(0, 0, 0.00);
        completeFlower.add(pistil);
        
        // がくを1つ追加
        const calyxGeometry = new THREE.ConeGeometry(
            0.08 * calyxScale,  // ★がくの底面半径
            0.03 * calyxScale,  // ★がくの高さ
            5
        );
        const calyxMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x228b22 
        });
        const calyx = new THREE.Mesh(calyxGeometry, calyxMaterial);
        calyx.position.set(0, -0.02 * calyxScale, 0); // ★位置もスケールに合わせる
        calyx.rotation.x = Math.PI;
        completeFlower.add(calyx);

        console.log(`✅ 完全な桜の花完成: 雄蕊${stamenScale}x + 雌蕊${pistilScale}x + がく${calyxScale}x`);
        
        return completeFlower;
    }

    // ★完全な桜の花を作成してシーンに追加
    const sakuraFlower = createCompleteSakuraFlower();
    scene.add(sakuraFlower);

    // 光源設定
    const sunLight = new THREE.DirectionalLight(0xffffff, 0.8);
    sunLight.position.set(3, 5, 2);
    sunLight.castShadow = true;
    scene.add(sunLight);

    const ambientLight = new THREE.AmbientLight(0x87ceeb, 0.4);
    scene.add(ambientLight);

    const fillLight = new THREE.DirectionalLight(0xffc0cb, 0.2);
    fillLight.position.set(-2, -1, 1);
    scene.add(fillLight);

    // アニメーション
    function animate() {
        requestAnimationFrame(animate);
        
        controls.update();
        
        // 花全体をゆっくり回転
        sakuraFlower.rotation.y += 0.002;
        
        // 微細な風の効果（花びらのみ）
        const time = Date.now() * 0.001;
        
        sakuraFlower.children.forEach((child, index) => {
            if (index < 5) { // 最初の5個が花びら
                const wave = Math.sin(time * 1.5 + index * 0.8) * 0.005;
                child.rotation.x += wave * 0.5;
                child.rotation.z += wave * 0.3;
            }
        });
        
        renderer.render(scene, camera);
    }

    animate();

    window.addEventListener('resize', () => {
        camera.aspect = canvas.width / canvas.height;
        camera.updateProjectionMatrix();
        renderer.setSize(canvas.width, canvas.height);
    });
}