import * as THREE from 'three';

/**
 * Model Exporter Service
 * Handles conversion of 3D models to STL format for 3D printing
 * Generates downloadable files with documentation
 */

/**
 * Exports a Three.js mesh or scene to STL binary format
 * @param {THREE.Mesh|THREE.Object3D} object - Object to export
 * @param {string} filename - Output filename (without extension)
 * @returns {null} - Triggers browser download
 */
export function exportToSTL(object, filename = 'creature') {
  try {
    // Collect all geometries
    const geometries = [];
    const scale = 1; // Could be parametrized for different print sizes

    object.traverse((child) => {
      if (child.isMesh && child.geometry) {
        // Clone the geometry to apply transformations
        let geometry = child.geometry.clone();

        // Apply the mesh's world transformation to geometry
        geometry.applyMatrix4(child.matrixWorld);

        geometries.push(geometry);
      }
    });

    if (geometries.length === 0) {
      throw new Error('No geometries found to export');
    }

    // Merge all geometries into one
    const mergedGeometry = mergeGeometries(geometries);

    // Generate STL
    const stlData = geometryToSTL(mergedGeometry, filename);

    // Trigger download
    downloadSTL(stlData, `${filename}.stl`);

    return true;
  } catch (error) {
    console.error('STL Export error:', error);
    throw error;
  }
}

/**
 * Merges multiple geometries into one
 * @param {THREE.BufferGeometry[]} geometries - Array of geometries to merge
 * @returns {THREE.BufferGeometry} - Merged geometry
 */
function mergeGeometries(geometries) {
  const positions = [];
  const normals = [];

  geometries.forEach((geo) => {
    // Ensure geometry has position attribute
    if (!geo.attributes.position) {
      console.warn('Geometry missing position attribute, skipping');
      return;
    }

    const posArray = geo.attributes.position.array;
    const normalArray = geo.attributes.normal?.array;

    // Add positions
    for (let i = 0; i < posArray.length; i += 3) {
      positions.push(posArray[i], posArray[i + 1], posArray[i + 2]);
    }

    // Add normals (generate if missing)
    if (normalArray) {
      for (let i = 0; i < normalArray.length; i++) {
        normals.push(normalArray[i]);
      }
    } else {
      // Generate normals for missing ones
      for (let i = 0; i < posArray.length; i += 9) {
        const nx = 0, ny = 1, nz = 0; // Default up normal
        for (let j = 0; j < 3; j++) {
          normals.push(nx, ny, nz);
        }
      }
    }
  });

  const merged = new THREE.BufferGeometry();
  merged.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));

  if (normals.length > 0) {
    merged.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(normals), 3));
  } else {
    merged.computeVertexNormals();
  }

  return merged;
}

/**
 * Converts a Three.js geometry to binary STL format
 * STL Format: ASCII or binary. Using binary format (more compact)
 * @param {THREE.BufferGeometry} geometry - Geometry to convert
 * @param {string} name - Model name (max 80 chars)
 * @returns {ArrayBuffer} - Binary STL data
 */
function geometryToSTL(geometry, name = 'object') {
  const positions = geometry.attributes.position.array;
  const normals = geometry.attributes.normal?.array;

  // Ensure we have normals
  if (!normals) {
    geometry.computeVertexNormals();
  }

  const normalArray = geometry.attributes.normal.array;

  // Number of triangles
  const triangles = positions.length / 9;

  // STL Binary format:
  // 80 byte header
  // 4 byte uint32 = number of triangles
  // For each triangle:
  //   12 bytes (3 * float32) = normal
  //   12 bytes (3 * float32) = vertex1
  //   12 bytes (3 * float32) = vertex2
  //   12 bytes (3 * float32) = vertex3
  //   2 bytes = attribute byte count (unused, set to 0)

  const dataSize = 84 + triangles * 50; // 80 + 4 + (50 * nTriangles)
  const buffer = new ArrayBuffer(dataSize);
  const view = new DataView(buffer);
  const dv = new DataView(buffer);

  // Write header
  const header = `Fire Horse NFT Creature - ${name}`.padEnd(80, '\0');
  for (let i = 0; i < 80; i++) {
    view.setUint8(i, header.charCodeAt(i) & 0xff);
  }

  // Write triangle count
  view.setUint32(80, triangles, true);

  // Write triangles
  let offset = 84;
  for (let i = 0; i < positions.length; i += 9) {
    // Normal (reuse from geometry or recalculate)
    const nIdx = i / 9;
    const nx = normalArray[i] || 0;
    const ny = normalArray[i + 1] || 1;
    const nz = normalArray[i + 2] || 0;

    // Normalize
    const nLen = Math.sqrt(nx * nx + ny * ny + nz * nz);
    const nxNorm = nLen > 0 ? nx / nLen : 0;
    const nyNorm = nLen > 0 ? ny / nLen : 1;
    const nzNorm = nLen > 0 ? nz / nLen : 0;

    dv.setFloat32(offset, nxNorm, true);
    offset += 4;
    dv.setFloat32(offset, nyNorm, true);
    offset += 4;
    dv.setFloat32(offset, nzNorm, true);
    offset += 4;

    // Vertices
    for (let j = 0; j < 3; j++) {
      dv.setFloat32(offset, positions[i + j * 3], true);
      offset += 4;
      dv.setFloat32(offset, positions[i + j * 3 + 1], true);
      offset += 4;
      dv.setFloat32(offset, positions[i + j * 3 + 2], true);
      offset += 4;
    }

    // Attribute byte count (unused)
    dv.setUint16(offset, 0, true);
    offset += 2;
  }

  return buffer;
}

/**
 * Triggers browser download of STL file
 * @param {ArrayBuffer} data - Binary STL data
 * @param {string} filename - Download filename
 */
function downloadSTL(data, filename) {
  const blob = new Blob([data], { type: 'application/octet-stream' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generates a ZIP file with STL and documentation
 * @param {THREE.Mesh} model - 3D model
 * @param {Object} creatureData - Creature metadata
 * @param {string} filename - Base filename
 */
export async function exportToSTLWithDocs(model, creatureData, filename = 'creature') {
  try {
    // For now, just export STL. Full ZIP with docs would require JSZip library
    const geometry = await mergeGeometries(
      model.traverse((child) => {
        return child.isMesh && child.geometry ? child.geometry : null;
      })
    );

    const stlData = geometryToSTL(geometry, creatureData.name);
    downloadSTL(stlData, `${filename}.stl`);

    // Create and download README
    const readmeContent = generatePrintingGuide(creatureData);
    const readmeBlob = new Blob([readmeContent], { type: 'text/plain' });
    const readmeUrl = URL.createObjectURL(readmeBlob);
    const readmeLink = document.createElement('a');
    readmeLink.href = readmeUrl;
    readmeLink.download = `${filename}_PRINTING_GUIDE.txt`;
    document.body.appendChild(readmeLink);
    readmeLink.click();
    document.body.removeChild(readmeLink);
    URL.revokeObjectURL(readmeUrl);

    return {
      success: true,
      files: [`${filename}.stl`, `${filename}_PRINTING_GUIDE.txt`]
    };
  } catch (error) {
    console.error('STL with docs export error:', error);
    throw error;
  }
}

/**
 * Generates printing guide documentation
 * @param {Object} creatureData - Creature metadata
 * @returns {string} - Formatted text guide
 */
function generatePrintingGuide(creatureData) {
  const date = new Date().toLocaleDateString();

  return `
FIRE HORSE NFT - 3D PRINTING GUIDE
==================================
Creature: ${creatureData.name}
ID: ${creatureData.uniqueId}
Date Generated: ${date}
Rarity: ${creatureData.rarity}

RECOMMENDED PRINT SETTINGS
==========================
Material: PLA or PETG (Fire-themed creatures benefit from bright colors)
Nozzle Temperature: 200-220°C
Bed Temperature: 60°C
Layer Height: 0.2mm (0.1mm for details)
Infill: 20-30%
Support: Required - tree supports recommended
Build Time: 8-12 hours (typical)

SIZE & SCALING
==============
Default Scale: 100mm height
For Larger Prints: Scale up in slicer (e.g., 150% = 150mm)
For Smaller Prints: Scale down (e.g., 50% = 50mm)

RECOMMENDED COLORS
==================
Primary Material: Orange or Red (matches Fire Horse theme)
Support Material: White or Natural (easy to remove)
Optional: Paint afterwards for enhanced details

POST-PROCESSING
===============
1. Remove support material carefully
2. Sand surface (80-220 grit progression)
3. Wash with warm water and soap
4. Paint for color detail (optional)
5. Apply UV-resistant varnish if exposed to sunlight

PRINTING CHECKLIST
==================
□ Verify scale matches your desired size
□ Enable supports (tree supports work best)
□ Check bed leveling before print
□ Monitor first layer carefully
□ Use brim or raft for adhesion
□ Ensure adequate cooling between layers

TROUBLESHOOTING
===============
Warping: Reduce bed temp to 55°C, increase nozzle temp to 225°C
Under-extrusion: Check nozzle cleanliness, increase temp
Stringing: Retraction enabled, reduce nozzle temp by 5°C
Layer adhesion: Ensure bed level, clean with IPA

FIRE HORSE NFT COLLECTION
==========================
Year of the Dragon - 2026
Limited Edition • Unique Digital Trophy

For more info: firehorse-nft.com
Support: support@firehorse-nft.com

Happy Printing! 🔥🐴
`;
}

/**
 * Validates if a model can be exported
 * @param {THREE.Object3D} object - Object to validate
 * @returns {boolean} - True if exportable
 */
export function isModelExportable(object) {
  let hasMeshes = false;
  object.traverse((child) => {
    if (child.isMesh && child.geometry) {
      hasMeshes = true;
    }
  });
  return hasMeshes;
}
