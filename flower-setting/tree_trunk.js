import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        initPlumeTree();
    }, 200);
});

function initPlumeTree() {
    const canvas = document.getElementById("treeCanvas");
    if (!canvas) {
        console.error('treeCanvas が見つかりません');
        return;
    }

    const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true,
        alpha: true
    });
    renderer.setSize(480, 360);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf3f9f1);

    const camera = new THREE.PerspectiveCamera(60, 480 / 360, 0.1, 1000);
    camera.position.set(1.2, 0.8, 1.5); //カメラ調整

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    controls.dampingFactor = 0.05;
    
    // ★追加：カメラの制御を調整
    controls.minDistance = 0.5;  // 最小距離
    controls.maxDistance = 3.0;  // 最大距離
    controls.target.set(0.5, 0.5, 0); // 枝の中央付近にフォーカス

    // ★梅の枝の特徴的なパターン：節で角度変化
    function createRealisticPlumBranch() {
        const branchGroup = new THREE.Group();
        
        const barkMaterial = new THREE.MeshStandardMaterial({
            color: 0x5d4037, // 梅の枝らしい濃い茶色
            roughness: 0.8,
            metalness: 0.0
        });

        // ★節の情報を定義
        const nodes = [
            { position: new THREE.Vector3(0, 0, 0), direction: new THREE.Vector3(1, 0, 0) },
            { position: new THREE.Vector3(0.4, 0.1, 0.05), direction: new THREE.Vector3(0.8, 0.6, -0.1) },
            { position: new THREE.Vector3(0.7, 0.35, 0), direction: new THREE.Vector3(0.6, 0.8, 0.2) },
            { position: new THREE.Vector3(0.9, 0.7, 0.15), direction: new THREE.Vector3(0.3, 0.9, -0.1) },
            { position: new THREE.Vector3(1.0, 1.1, 0.1), direction: new THREE.Vector3(0.2, 1.0, 0.1) }
        ];

        // ★節間のセグメントを作成
        for (let i = 0; i < nodes.length - 1; i++) {
            const startNode = nodes[i];
            const endNode = nodes[i + 1];
            
            // セグメントの長さ
            const segmentLength = startNode.position.distanceTo(endNode.position);
            
            // セグメントの中心点
            const centerPoint = new THREE.Vector3()
                .addVectors(startNode.position, endNode.position)
                .multiplyScalar(0.5);
            
            // セグメントの方向
            const direction = new THREE.Vector3()
                .subVectors(endNode.position, startNode.position)
                .normalize();

            // ★適度に真っ直ぐなセグメント作成
            const segmentGeometry = new THREE.CylinderGeometry(
                0.02 * (1 - i * 0.15), // 先端に向かって細くなる
                0.025 * (1 - i * 0.1),
                segmentLength,
                12
            );

            const segment = new THREE.Mesh(segmentGeometry, barkMaterial);
            
            // セグメントの位置
            segment.position.copy(centerPoint);
            
            // セグメントの向きを設定
            const quaternion = new THREE.Quaternion();
            quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);
            segment.setRotationFromQuaternion(quaternion);
            
            // ★微細な凸凹を追加
            const positions = segmentGeometry.attributes.position;
            for (let j = 0; j < positions.count; j++) {
                const vertex = new THREE.Vector3();
                vertex.fromBufferAttribute(positions, j);
                
                const noise = (Math.random() - 0.5) * 0.003;
                vertex.x += noise;
                vertex.z += noise;
                
                positions.setXYZ(j, vertex.x, vertex.y, vertex.z);
            }
            positions.needsUpdate = true;
            segmentGeometry.computeVertexNormals();

            segment.castShadow = true;
            segment.receiveShadow = true;
            branchGroup.add(segment);
        }

        // ★節（ふし）を作成
        for (let i = 1; i < nodes.length - 1; i++) {
            const node = nodes[i];
            
            // 節の膨らみ
            const nodeGeometry = new THREE.SphereGeometry(0.018, 12, 12);
            const nodeSwelling = new THREE.Mesh(nodeGeometry, barkMaterial);
            nodeSwelling.position.copy(node.position);
            nodeSwelling.castShadow = true;
            branchGroup.add(nodeSwelling);

            // ★節から小枝を追加（1-2本）
            const subBranchCount = Math.random() > 0.5 ? 1 : 2;
            for (let j = 0; j < subBranchCount; j++) {
                createSubBranch(node.position, branchGroup, barkMaterial, i);
            }
        }

        return branchGroup;
    }

    // ★小枝作成関数（節から分岐）
    function createSubBranch(nodePosition, parentGroup, material, generation) {
        // 小枝の方向（ランダムだが自然な角度）
        const branchDirection = new THREE.Vector3(
            (Math.random() - 0.5) * 1.5,
            Math.random() * 0.8 + 0.2, // 上向き傾向
            (Math.random() - 0.5) * 1.2
        ).normalize();

        // 小枝の長さ
        const branchLength = 0.2 + Math.random() * 0.3;
        
        // ★小枝のセグメント数（2-4個に増加）
        const segments = 2 + Math.floor(Math.random() * 3);
        
        // ★小枝の節の位置を定義
        const subNodes = [];
        for (let i = 0; i <= segments; i++) {
            const t = i / segments;
            const position = new THREE.Vector3()
                .copy(nodePosition)
                .add(branchDirection.clone().multiplyScalar(branchLength * t));
            
            // 小さなランダムな変化を追加
            position.add(new THREE.Vector3(
                (Math.random() - 0.5) * 0.02,
                (Math.random() - 0.5) * 0.02,
                (Math.random() - 0.5) * 0.02
            ));
            
            subNodes.push(position);
        }
        
        // ★小枝のセグメントを節間で作成
        for (let i = 0; i < subNodes.length - 1; i++) {
            const startPos = subNodes[i];
            const endPos = subNodes[i + 1];
            
            const segmentLength = startPos.distanceTo(endPos);
            const segmentRadius = 0.008 * (1 - i * 0.25) * (1 - generation * 0.2);
            
            // セグメントの中心点と方向
            const centerPoint = new THREE.Vector3()
                .addVectors(startPos, endPos)
                .multiplyScalar(0.5);
            
            const direction = new THREE.Vector3()
                .subVectors(endPos, startPos)
                .normalize();
            
            const segmentGeometry = new THREE.CylinderGeometry(
                segmentRadius * 0.8,
                segmentRadius,
                segmentLength,
                8
            );
            
            const subBranch = new THREE.Mesh(segmentGeometry, material);
            
            // セグメントの位置と向き
            subBranch.position.copy(centerPoint);
            
            const quaternion = new THREE.Quaternion();
            quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);
            subBranch.setRotationFromQuaternion(quaternion);
            
            // ★微細な凸凹を小枝にも追加
            const positions = segmentGeometry.attributes.position;
            for (let j = 0; j < positions.count; j++) {
                const vertex = new THREE.Vector3();
                vertex.fromBufferAttribute(positions, j);
                
                const noise = (Math.random() - 0.5) * 0.002; // メインの枝より小さなノイズ
                vertex.x += noise;
                vertex.z += noise;
                
                positions.setXYZ(j, vertex.x, vertex.y, vertex.z);
            }
            positions.needsUpdate = true;
            segmentGeometry.computeVertexNormals();
            
            subBranch.castShadow = true;
            parentGroup.add(subBranch);
        }

        // ★小枝の節を作成（中間の節のみ）
        for (let i = 1; i < subNodes.length - 1; i++) {
            const nodePos = subNodes[i];
            
            // 小枝の節の膨らみ（メインより小さく）
            const nodeRadius = 0.010 * (1 - generation * 0.3);
            const nodeGeometry = new THREE.SphereGeometry(nodeRadius, 8, 8);
            const nodeSwelling = new THREE.Mesh(nodeGeometry, material);
            nodeSwelling.position.copy(nodePos);
            nodeSwelling.castShadow = true;
            parentGroup.add(nodeSwelling);

            // ★小枝の節からさらに細い枝を分岐（確率的）
            if (generation < 3 && Math.random() > 0.7) {
                createTertiaryBranch(nodePos, parentGroup, material, generation + 1);
            }
        }

        // 小枝の先端に更に小さな枝（確率的）
        if (generation < 2 && Math.random() > 0.6) {
            const tipPosition = subNodes[subNodes.length - 1];
            createTinyTwig(tipPosition, parentGroup, material);
        }
    }

    // ★新しい関数：三次分岐（小枝から更に分岐）
    function createTertiaryBranch(nodePosition, parentGroup, material, generation) {
        // より細い枝の方向
        const branchDirection = new THREE.Vector3(
            (Math.random() - 0.5) * 2,
            Math.random() * 0.6 + 0.1, // 上向き傾向を弱める
            (Math.random() - 0.5) * 2
        ).normalize();

        // より短い枝
        const branchLength = 0.08 + Math.random() * 0.15;
        const segments = 1 + Math.floor(Math.random() * 2); // 1-2セグメント
        
        // 三次分岐の節を定義
        const tertiaryNodes = [];
        for (let i = 0; i <= segments; i++) {
            const t = i / segments;
            const position = new THREE.Vector3()
                .copy(nodePosition)
                .add(branchDirection.clone().multiplyScalar(branchLength * t));
            
            tertiaryNodes.push(position);
        }
        
        // 三次分岐のセグメントを作成
        for (let i = 0; i < tertiaryNodes.length - 1; i++) {
            const startPos = tertiaryNodes[i];
            const endPos = tertiaryNodes[i + 1];
            
            const segmentLength = startPos.distanceTo(endPos);
            const segmentRadius = 0.004 * (1 - i * 0.3) * (1 - generation * 0.15);
            
            const centerPoint = new THREE.Vector3()
                .addVectors(startPos, endPos)
                .multiplyScalar(0.5);
            
            const direction = new THREE.Vector3()
                .subVectors(endPos, startPos)
                .normalize();
            
            const segmentGeometry = new THREE.CylinderGeometry(
                segmentRadius * 0.7,
                segmentRadius,
                segmentLength,
                6
            );
            
            const tertiaryBranch = new THREE.Mesh(segmentGeometry, material);
            
            tertiaryBranch.position.copy(centerPoint);
            
            const quaternion = new THREE.Quaternion();
            quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);
            tertiaryBranch.setRotationFromQuaternion(quaternion);
            
            tertiaryBranch.castShadow = true;
            parentGroup.add(tertiaryBranch);
        }

        // ★三次分岐の節（小さな膨らみ）
        for (let i = 1; i < tertiaryNodes.length - 1; i++) {
            const nodePos = tertiaryNodes[i];
            
            const nodeRadius = 0.006 * (1 - generation * 0.2);
            const nodeGeometry = new THREE.SphereGeometry(nodeRadius, 6, 6);
            const nodeSwelling = new THREE.Mesh(nodeGeometry, material);
            nodeSwelling.position.copy(nodePos);
            nodeSwelling.castShadow = true;
            parentGroup.add(nodeSwelling);
        }

        // 先端に極小の枝
        if (Math.random() > 0.8) {
            const tipPosition = tertiaryNodes[tertiaryNodes.length - 1];
            createTinyTwig(tipPosition, parentGroup, material);
        }
    }

    // ★極小の枝（先端の細かい分岐）- 節付きバージョン
    function createTinyTwig(position, parentGroup, material) {
        for (let i = 0; i < 2; i++) {
            const twigDirection = new THREE.Vector3(
                (Math.random() - 0.5) * 2,
                Math.random() * 0.5 + 0.3,
                (Math.random() - 0.5) * 2
            ).normalize();

            const twigLength = 0.04 + Math.random() * 0.08;
            
            // ★極小の枝も2セグメントに分割
            const segments = 2;
            for (let j = 0; j < segments; j++) {
                const segmentLength = twigLength / segments;
                const segmentRadius = 0.002 * (1 - j * 0.3);
                
                const segmentGeometry = new THREE.CylinderGeometry(
                    segmentRadius * 0.6,
                    segmentRadius,
                    segmentLength,
                    4
                );
                const twig = new THREE.Mesh(segmentGeometry, material);
                
                const segmentPosition = new THREE.Vector3()
                    .copy(position)
                    .add(twigDirection.clone().multiplyScalar(segmentLength * (j + 0.5)));
                
                twig.position.copy(segmentPosition);
                
                const quaternion = new THREE.Quaternion();
                quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), twigDirection);
                twig.setRotationFromQuaternion(quaternion);
                
                // 少し曲げる
                twig.rotation.z += (Math.random() - 0.5) * 0.3;
                twig.rotation.x += (Math.random() - 0.5) * 0.3;
                
                twig.castShadow = true;
                parentGroup.add(twig);
            }

            // ★極小の節
            const nodePosition = new THREE.Vector3()
                .copy(position)
                .add(twigDirection.clone().multiplyScalar(twigLength * 0.5));
            
            const tinyNodeGeometry = new THREE.SphereGeometry(0.003, 4, 4);
            const tinyNode = new THREE.Mesh(tinyNodeGeometry, material);
            tinyNode.position.copy(nodePosition);
            tinyNode.castShadow = true;
            parentGroup.add(tinyNode);
        }
    }

    // 梅の枝を作成してシーンに追加
    const plumBranch = createRealisticPlumBranch();
    scene.add(plumBranch);

    // 光源
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight.position.set(3, 5, 2);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 0.1;
    dirLight.shadow.camera.far = 20;
    dirLight.shadow.camera.left = -3;
    dirLight.shadow.camera.right = 3;
    dirLight.shadow.camera.top = 3;
    dirLight.shadow.camera.bottom = -3;
    scene.add(dirLight);

    const ambLight = new THREE.AmbientLight(0x87ceeb, 0.3);
    scene.add(ambLight);

    const rimLight = new THREE.DirectionalLight(0xffc0cb, 0.4);
    rimLight.position.set(-2, 2, -3);
    scene.add(rimLight);

    // アニメーション
    function animate() {
        requestAnimationFrame(animate);

        // 微細な風の揺れ
        const t = Date.now() * 0.001;
        const sway = Math.sin(t * 1.5) * 0.008;
        plumBranch.rotation.z = sway;
        plumBranch.rotation.x = sway * 0.3;

        // ゆっくり回転
        plumBranch.rotation.y += 0.003;

        controls.update();
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
