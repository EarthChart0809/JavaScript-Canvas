import * as THREE from 'three';

// ★追加：節の位置データを取得する関数をexport
export function getBranchNodes() {
    return [
        { position: new THREE.Vector3(0, 0, 0), direction: new THREE.Vector3(1, 0, 0) },
        { position: new THREE.Vector3(0.4, 0.1, 0.05), direction: new THREE.Vector3(0.8, 0.6, -0.1) },
        { position: new THREE.Vector3(0.7, 0.35, 0), direction: new THREE.Vector3(0.6, 0.8, 0.2) },
        { position: new THREE.Vector3(0.9, 0.7, 0.15), direction: new THREE.Vector3(0.3, 0.9, -0.1) },
        { position: new THREE.Vector3(1.0, 1.1, 0.1), direction: new THREE.Vector3(0.2, 1.0, 0.1) }
    ];
}

// ★修正：デフォルトマテリアルを作成する関数をexport
export function createBranchMaterial() {
    return new THREE.MeshStandardMaterial({
        color: 0x4a3728, // 桜の枝らしい濃い茶色（梅から桜に変更）
        roughness: 0.8,
        metalness: 0.0
    });
}

// ★梅の枝の特徴的なパターン：節で角度変化
export function createRealisticPlumBranch() {
    const branchGroup = new THREE.Group();
    
    const barkMaterial = createBranchMaterial();

    // ★修正：節の情報を関数から取得
    const nodes = getBranchNodes();

    // ★節間のセグメントを作成
    for (let i = 0; i < nodes.length - 1; i++) {
        const startNode = nodes[i];
        const endNode = nodes[i + 1];
        
        const segmentLength = startNode.position.distanceTo(endNode.position);
        
        const centerPoint = new THREE.Vector3()
            .addVectors(startNode.position, endNode.position)
            .multiplyScalar(0.5);
        
        const direction = new THREE.Vector3()
            .subVectors(endNode.position, startNode.position)
            .normalize();

        const segmentGeometry = new THREE.CylinderGeometry(
            0.02 * (1 - i * 0.15),
            0.025 * (1 - i * 0.1),
            segmentLength,
            12
        );

        const segment = new THREE.Mesh(segmentGeometry, barkMaterial);
        segment.position.copy(centerPoint);
        
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
        
        const nodeGeometry = new THREE.SphereGeometry(0.018, 12, 12);
        const nodeSwelling = new THREE.Mesh(nodeGeometry, barkMaterial);
        nodeSwelling.position.copy(node.position);
        nodeSwelling.castShadow = true;
        branchGroup.add(nodeSwelling);

        // ★節から小枝を追加（確率的に）
        if (Math.random() > 0.4) {
            const subBranchCount = Math.random() > 0.7 ? 2 : 1;
            for (let j = 0; j < subBranchCount; j++) {
                createSubBranch(node.position, branchGroup, barkMaterial, i);
            }
        }
    }

    return branchGroup;
}

// ★小枝作成関数（節から分岐）
export function createSubBranch(nodePosition, parentGroup, material, generation) {
    const branchDirection = new THREE.Vector3(
        (Math.random() - 0.5) * 1.5,
        Math.random() * 0.8 + 0.2,
        (Math.random() - 0.5) * 1.2
    ).normalize();

    const branchLength = 0.15 + Math.random() * 0.2; // ★少し短くして花が見やすく
    const segments = 2 + Math.floor(Math.random() * 2);
    
    const subNodes = [];
    for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        const position = new THREE.Vector3()
            .copy(nodePosition)
            .add(branchDirection.clone().multiplyScalar(branchLength * t));
        
        position.add(new THREE.Vector3(
            (Math.random() - 0.5) * 0.015,
            (Math.random() - 0.5) * 0.015,
            (Math.random() - 0.5) * 0.015
        ));
        
        subNodes.push(position);
    }
    
    // セグメント作成
    for (let i = 0; i < subNodes.length - 1; i++) {
        const startPos = subNodes[i];
        const endPos = subNodes[i + 1];
        
        const segmentLength = startPos.distanceTo(endPos);
        const segmentRadius = 0.008 * (1 - i * 0.25) * (1 - generation * 0.2);
        
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
        subBranch.position.copy(centerPoint);
        
        const quaternion = new THREE.Quaternion();
        quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);
        subBranch.setRotationFromQuaternion(quaternion);
        
        // 微細な凸凹
        const positions = segmentGeometry.attributes.position;
        for (let j = 0; j < positions.count; j++) {
            const vertex = new THREE.Vector3();
            vertex.fromBufferAttribute(positions, j);
            
            const noise = (Math.random() - 0.5) * 0.002;
            vertex.x += noise;
            vertex.z += noise;
            
            positions.setXYZ(j, vertex.x, vertex.y, vertex.z);
        }
        positions.needsUpdate = true;
        segmentGeometry.computeVertexNormals();
        
        subBranch.castShadow = true;
        parentGroup.add(subBranch);
    }

    // 小枝の節
    for (let i = 1; i < subNodes.length - 1; i++) {
        const nodePos = subNodes[i];
        
        const nodeRadius = 0.010 * (1 - generation * 0.3);
        const nodeGeometry = new THREE.SphereGeometry(nodeRadius, 8, 8);
        const nodeSwelling = new THREE.Mesh(nodeGeometry, material);
        nodeSwelling.position.copy(nodePos);
        nodeSwelling.castShadow = true;
        parentGroup.add(nodeSwelling);

        // さらに細い枝を分岐（確率的）
        if (generation < 3 && Math.random() > 0.8) {
            createTertiaryBranch(nodePos, parentGroup, material, generation + 1);
        }
    }

    // 小枝の先端に更に小さな枝（確率的）
    if (generation < 2 && Math.random() > 0.7) {
        const tipPosition = subNodes[subNodes.length - 1];
        createTinyTwig(tipPosition, parentGroup, material);
    }
}

// ★三次分岐（小枝から更に分岐）
export function createTertiaryBranch(nodePosition, parentGroup, material, generation) {
    const branchDirection = new THREE.Vector3(
        (Math.random() - 0.5) * 2,
        Math.random() * 0.6 + 0.1,
        (Math.random() - 0.5) * 2
    ).normalize();

    const branchLength = 0.06 + Math.random() * 0.12; // ★より短く
    const segments = 1 + Math.floor(Math.random() * 2);
    
    const tertiaryNodes = [];
    for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        const position = new THREE.Vector3()
            .copy(nodePosition)
            .add(branchDirection.clone().multiplyScalar(branchLength * t));
        
        tertiaryNodes.push(position);
    }
    
    // セグメント作成
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

    // 三次分岐の節
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

// ★極小の枝（先端の細かい分岐）
export function createTinyTwig(position, parentGroup, material) {
    const twigCount = 1 + Math.floor(Math.random() * 2); // 1-2本
    
    for (let i = 0; i < twigCount; i++) {
        const twigDirection = new THREE.Vector3(
            (Math.random() - 0.5) * 2,
            Math.random() * 0.5 + 0.3,
            (Math.random() - 0.5) * 2
        ).normalize();

        const twigLength = 0.03 + Math.random() * 0.06; // ★さらに短く
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
            
            twig.rotation.z += (Math.random() - 0.5) * 0.3;
            twig.rotation.x += (Math.random() - 0.5) * 0.3;
            
            twig.castShadow = true;
            parentGroup.add(twig);
        }

        // 極小の節
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

