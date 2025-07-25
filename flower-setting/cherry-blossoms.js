import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// ★修正：DOMContentLoadedイベントを使用
document.addEventListener('DOMContentLoaded', () => {
    // 少し遅延させて初期化
    setTimeout(() => {
        initSakura();
    }, 100); // 100ms遅延
});

function initSakura() {
    const canvas = document.getElementById("sakuraCanvas");
    
    if (!canvas) {
        console.error('sakuraCanvas が見つかりません');
        return;
    }

    // WebGLコンテキストの設定を追加
    const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true,
        alpha: true,
        preserveDrawingBuffer: true, // ★追加
        powerPreference: "high-performance" // ★追加
    });

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf3f9f1); // 春の空のような青
    
    const camera = new THREE.PerspectiveCamera(
        60, canvas.width / canvas.height, 0.1, 1000
    );
    camera.position.set(0, 0.5, 1.5); //カメラ調整

    renderer.setSize(canvas.width, canvas.height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCSShadowMap;

    // OrbitControlsを追加
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // よりリアルな桜の花びらを作成する関数
    function createRealisticSakuraPetal(size, color, angle, index) {
        // 花びらの形状（より桜らしいハート型のくぼみ）
        const petalShape = new THREE.Shape();
        
        // 桜の花びら特有の先端のくぼみを表現
        petalShape.moveTo(0, 0);
        // petalShape.quadraticCurveTo(size * 0.3, size * 0.1, size * 0.8, size * 0.4);
        // petalShape.quadraticCurveTo(size * 1.0, size * 0.8, size * 0.9, size * 1.1);
        // petalShape.quadraticCurveTo(size * 0.6, size * 1.2, size * 0.2, size * 1.0); // 先端のくぼみ
        // petalShape.quadraticCurveTo(size * 0.1, size * 1.2, size * 0.0, size * 1.0);
        // petalShape.quadraticCurveTo(-size * 0.1, size * 1.2, -size * 0.2, size * 1.0);
        // petalShape.quadraticCurveTo(-size * 0.6, size * 1.2, -size * 0.9, size * 1.1);
        // petalShape.quadraticCurveTo(-size * 1.0, size * 0.8, -size * 0.8, size * 0.4);
        // petalShape.quadraticCurveTo(-size * 0.3, size * 0.1, 0, 0);

        petalShape.quadraticCurveTo(size * 0.5, size * 0.2, size, size * 0.6);
        petalShape.quadraticCurveTo(size * 0.9, size * 1.0, size * 0.5, size * 1.2);
        petalShape.quadraticCurveTo(size * 0.2, size * 1.3, 0, size * 1.0);
        petalShape.quadraticCurveTo(-size * 0.2, size * 0.7, -size * 0.1, size * 0.3);
        petalShape.quadraticCurveTo(-size * 0.05, size * 0.1, 0, 0);
        
        const extrudeSettings = {
            depth: 0.015,
            bevelEnabled: true,
            bevelThickness: 0.008,
            bevelSize: 0.005,
            bevelSegments: 4
        };
        
        const petalGeometry = new THREE.ExtrudeGeometry(petalShape, extrudeSettings);
        
        // ジオメトリに自然な湾曲を追加
        const positionAttribute = petalGeometry.attributes.position;
        const vertex = new THREE.Vector3();
        
        for (let i = 0; i < positionAttribute.count; i++) {
            vertex.fromBufferAttribute(positionAttribute, i);
            
            // 花びらの自然な湾曲（先端ほど強く湾曲）
            const normalizedY = vertex.y / size;
            const curvature = Math.sin(normalizedY * Math.PI * 0.5) * 0.08;
            const radialCurve = Math.sqrt(vertex.x ** 2 + vertex.y ** 2) / size;
            vertex.z += curvature * radialCurve;
            
            // 花びらの端を少し下に垂らす
            if (normalizedY > 0.3) {
                vertex.z -= (normalizedY - 0.7) * 0.1;
            }
            
            positionAttribute.setXYZ(i, vertex.x, vertex.y, vertex.z);
        }
        
        positionAttribute.needsUpdate = true;
        petalGeometry.computeVertexNormals();
        
        // より細かい色のバリエーション
        const baseColor = new THREE.Color(color);
        
        const petalMaterial = new THREE.MeshPhongMaterial({
            color: baseColor,
            transparent: true,
            opacity: 0.92,
            side: THREE.DoubleSide,
            roughness: 0.3,
            metalness: 0.05
        });
        
        const petal = new THREE.Mesh(petalGeometry, petalMaterial);
        
        // 花びらの配置（より自然な重なり）
        const radius = -0.01 + Math.random() * 0.02;
        petal.position.x = Math.cos(angle) * radius;
        petal.position.y = Math.sin(angle) * radius;
        petal.position.z = 0 // 微細な高さの違い
        
        // 花びらの向きと傾き
        petal.rotation.z = angle + Math.PI / 2;
        petal.rotation.x = -Math.PI / 2 + Math.sin(index) * 0.05; // 微細な個体差
        petal.rotation.y = (Math.random() - 0.5) * 0.1; // 自然なばらつき
        
        return petal;
    }

    // 雄蕊を作成する関数
    function createStamen(count = 20) {
        const stamenGroup = new THREE.Group();
        
        for (let i = 0; i < count; i++) {
            // 雄蕊の軸
            const stalkGeometry = new THREE.CylinderGeometry(0.002, 0.003, 0.08);
            const stalkMaterial = new THREE.MeshStandardMaterial({ 
                color: 0x90ee90 // 薄緑色
            });
            const stalk = new THREE.Mesh(stalkGeometry, stalkMaterial);
            
            // 雄蕊の葯（やく）
            const antherGeometry = new THREE.SphereGeometry(0.008, 8, 8);
            const antherMaterial = new THREE.MeshStandardMaterial({ 
                color: 0xffd700 // 金色
            });
            const anther = new THREE.Mesh(antherGeometry, antherMaterial);
            anther.position.y = 0.04;
            
            // ランダムな位置に配置
            const angle = (i / count) * Math.PI * 2;
            const radius = 0.03 + Math.PI * 0.02;

            // 雄蕊（おしべ）の部品をグループ化
            const stamenUnit = new THREE.Group();
            stamenUnit.add(stalk);
            stamenUnit.add(anther);

            // 配置：めしべを中心に円形
            stamenUnit.position.x = Math.cos(angle) * radius;
            stamenUnit.position.y = Math.sin(angle) * radius;
            stamenUnit.position.z = 0.005 + Math.random() * 0.005;

            // 向き調整：中心から外側に向ける
            // -----------------------------------
            const direction = new THREE.Vector3(
                Math.cos(angle),
                Math.sin(angle),
                2.4  // 少し上向きに
            ).normalize();

            const quaternion = new THREE.Quaternion();
            quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction); // Y軸から方向へ回す
            stamenUnit.setRotationFromQuaternion(quaternion);

            // 少しランダムに傾けると自然
            stamenUnit.rotation.x += (Math.random() - 0.5) * 0.2;
            stamenUnit.rotation.y += (Math.random() - 0.5) * 0.2;

            stamenGroup.add(stamenUnit);

            }
            // ★追加：雄蕊全体を90度傾ける
            stamenGroup.rotation.x = Math.PI / 2; // 90度回転
            stamenGroup.position.set(0, -0.05, 0); // 少し前に配置
        
            return stamenGroup;
        }

    // 雌蕊を作成する関数
    function createPistil() {
        const pistilGeometry = new THREE.CylinderGeometry(0.004, 0.004, 0.06);
        const pistilMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x98fb98 // 薄緑色
        });
        const pistil = new THREE.Mesh(pistilGeometry, pistilMaterial);
        
        // 雌蕊の先端（柱頭）
        const stigmaGeometry = new THREE.SphereGeometry(0.006, 8, 8);
        const stigmaMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xffffff // 白色
        });
        const stigma = new THREE.Mesh(stigmaGeometry, stigmaMaterial);
        stigma.position.y = 0.035;
        
        const pistilGroup = new THREE.Group();
        pistilGroup.add(pistil);
        pistilGroup.add(stigma);

         // 雌蕊を中央に固定
        pistilGroup.position.set(0, 0, 0.00); // 少し前に
        
        return pistilGroup;
    }

    // 桜の花全体を作成
    const sakuraFlower = new THREE.Group();
    
    // 5枚の花びらを配置
    const petalColors = [0xff69b4, 0xff69b4, 0xff69b4, 0xff69b4, 0xff69b4];

    for (let i = 0; i < 5; i++) {
        const angle = (i / 5) * Math.PI * 2;
        const petal = createRealisticSakuraPetal(0.2, petalColors[i], angle, i);
        sakuraFlower.add(petal);
    }
    
    // 雄蕊を追加
    const stamens = createStamen(8);
    sakuraFlower.add(stamens);
    
    // 雌蕊を追加
    const pistil = createPistil();
    pistil.position.y = -0.02; // 少し上に配置
    sakuraFlower.add(pistil);
    
    // 花の台座（がく）
    const calyxGeometry = new THREE.ConeGeometry(0.08, 0.03, 5);
    const calyxMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x228b22 // 緑色
    });
    const calyx = new THREE.Mesh(calyxGeometry, calyxMaterial);
    calyx.position.z = 0.00;
    calyx.position.y = 0.02; // 少し下に配置
    calyx.rotation.x = Math.PI*2;
    sakuraFlower.add(calyx);

    // 追加
    sakuraFlower.rotation.x = Math.PI; // 180度回転で花を上向きに
    stamens.rotation.x = Math.PI/2; // 雄蕊を下向きに
    pistil.rotation.x = Math.PI; // 雌蕊を下向きに

    scene.add(sakuraFlower);

    // より自然な光源設定
    const sunLight = new THREE.DirectionalLight(0xffffff, 0.8);
    sunLight.position.set(3, 5, 2);
    sunLight.castShadow = true;
    scene.add(sunLight);

    const ambientLight = new THREE.AmbientLight(0x87ceeb, 0.4); // 空の色
    scene.add(ambientLight);

    // 微細な環境光（桜の花に反射する光）
    const fillLight = new THREE.DirectionalLight(0xffc0cb, 0.2);
    fillLight.position.set(-2, -1, 1);
    scene.add(fillLight);

    // アニメーション
    function animate() {
        requestAnimationFrame(animate);
        
        controls.update();
        
        // 花全体をゆっくり回転
        sakuraFlower.rotation.y += 0.002;
        
        // 微細な風の効果
        const time = Date.now() * 0.001;
        sakuraFlower.children.forEach((child, index) => {
            if (index < 5) { // 花びらのみ
                const wave = Math.sin(time * 1.5 + index * 0.8) * 0.008;
                child.rotation.x = Math.PI / 2 + wave;
            }
        });
        
        renderer.render(scene, camera);
    }

    animate();

    // リサイズ対応
    window.addEventListener('resize', () => {
        camera.aspect = canvas.width / canvas.height;
        camera.updateProjectionMatrix();
        renderer.setSize(canvas.width, canvas.height);
    });
}