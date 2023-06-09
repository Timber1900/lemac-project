<template>
  <div class="w-full h-full">
    <div class="border-red-600 border w-full h-[60vh]">
    </div>
    <v-form class="max-w-6xl px-4 mx-auto" @submit.prevent>
      <h1 class="w-full m-6 text-4xl font-medium text-center">
        3D Printing submission form:
      </h1>
      <v-row class="gap-4 mx-0">
        <v-text-field
          v-model="firstName"
          :rules="rules"
          label="First name"
        ></v-text-field>
        <v-text-field
          v-model="lastName"
          :rules="rules"
          label="Last Name"
        ></v-text-field>
      </v-row>
      <v-row class="gap-4 mx-0">
        <v-text-field
          v-model="id"
          :rules="rules"
          label="IST ID"
        ></v-text-field>
        <v-file-input
          label="Model STL"
          accept=".stl,.step,.stp"
          v-model="file"
          @change="test"
        ></v-file-input>
      </v-row>
      <v-row class="gap-4 mx-0">
        <span>Volume: {{  }}</span>
      </v-row>
      <v-btn type="submit" block class="mt-2">Submit</v-btn>
    </v-form>
  </div>
</template>

<script>
  import * as THREE from 'three';

  export default {
    name: 'HomePrinting',
    components: {},
    data: () => ({
      rules: [
        value => {
          if (value) return true

          return "Field can't be left empty"
        },
      ],
      firstName: null,
      lastName: null,
      id: null,
      file: null,
      volume: null,
      boundingBoxSize: null
    }),
    mounted() {
    },
    methods: {
      test(e) {
        const read = new FileReader();
        read.readAsBinaryString(e);

        read.onloadend = function(){
          if(read.result) {
            const binaryContents = read.result // Your binary contents here
            const arrayBuffer = this.binaryStringToArrayBuffer(binaryContents);
            this.parseBinarySTL(arrayBuffer);
          }
        }
      },

      parseBinarySTL(data) {
        const geometry = new THREE.BufferGeometry();
        const vertices = [];

        const dv = new DataView(data);
        let offset = 80; // Skip the header (80 bytes)

        // Read the number of triangles (faces)
        const numTriangles = dv.getUint32(offset, true);
        offset += 4;

        for (let i = 0; i < numTriangles; i++) {
          // Skip the normal vector (12 bytes)
          offset += 12;

          // Read the vertices (3 * 12 bytes)
          for (let j = 0; j < 3; j++) {
            const x = dv.getFloat32(offset, true);
            const y = dv.getFloat32(offset + 4, true);
            const z = dv.getFloat32(offset + 8, true);

            vertices.push(x, y, z);
            offset += 12;
          }

          // Skip the attribute byte count (2 bytes)
          offset += 2;
        }

        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        const mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial());

        // Calculate volume
        this.volume = this.calculateVolume(mesh);

        // Calculate bounding box size
        const boundingBox = new THREE.Box3().setFromObject(mesh);
        this.boundingBoxSize = boundingBox.getSize(new THREE.Vector3());

        // Output the results
        console.log('Volume:', volume);
        console.log('Bounding box size:', boundingBoxSize);
      },

      calculateVolume(mesh) {
        const geometry = mesh.geometry;
        const position = geometry.attributes.position.array;
        const indices = geometry.index ? geometry.index.array : null;

        let volume = 0;
        let vA, vB, vC;
        const pA = new THREE.Vector3();
        const pB = new THREE.Vector3();
        const pC = new THREE.Vector3();

        if (indices) {
          let iA, iB, iC;
          for (let i = 0; i < indices.length; i += 3) {
            iA = indices[i];
            iB = indices[i + 1];
            iC = indices[i + 2];

            vA = this.getVertex(iA, position, pA);
            vB = this.getVertex(iB, position, pB);
            vC = this.getVertex(iC, position, pC);

            volume += this.signedVolumeOfTriangle(vA, vB, vC);
          }
        } else {
          for (let i = 0; i < position.length; i += 9) {
            vA = this.getVertex(i, position, pA);
            vB = this.getVertex(i + 3, position, pB);
            vC = this.getVertex(i + 6, position, pC);

            volume += this.signedVolumeOfTriangle(vA, vB, vC);
          }
        }

        return Math.abs(volume);
      },

      getVertex(index, position, target) {
        target.x = position[index];
        target.y = position[index + 1];
        target.z = position[index + 2];
        return target;
      },

      signedVolumeOfTriangle(p1, p2, p3) {
        return p1.dot(p2.cross(p3)) / 6;
      },

      binaryStringToArrayBuffer(binaryString) {
        const buffer = new ArrayBuffer(binaryString.length);
        const bufferView = new Uint8Array(buffer);
        for (let i = 0; i < binaryString.length; i++) {
          bufferView[i] = binaryString.charCodeAt(i);
        }
        return buffer;
      }

    },
  };
  </script>
<template>
  <div class="w-full h-full">
    <div class="border-red-600 border w-full h-[60vh]">
    </div>
    <v-form class="max-w-6xl px-4 mx-auto" @submit.prevent>
      <h1 class="w-full m-6 text-4xl font-medium text-center">
        3D Printing submission form:
      </h1>
      <v-row class="gap-4 mx-0">
        <v-text-field
          v-model="firstName"
          :rules="rules"
          label="First name"
        ></v-text-field>
        <v-text-field
          v-model="lastName"
          :rules="rules"
          label="Last Name"
        ></v-text-field>
      </v-row>
      <v-row class="gap-4 mx-0">
        <v-text-field
          v-model="id"
          :rules="rules"
          label="IST ID"
        ></v-text-field>
        <v-file-input
          label="Model STL"
          accept=".stl,.step,.stp"
          v-model="file"
          @change="test"
        ></v-file-input>
      </v-row>
      <v-row class="gap-4 mx-0">
        <div class="w-48">
          <v-select
            :items="units"
            v-model="choosen_unit"
            label="Unit of file"
          ></v-select>
        </div>
      </v-row>
      <div class="flex flex-col items-start justify-start gap-4 mx-0 my-4">
        <span class="text-base"><b class="text-xl">Volume:</b> {{ volume?.toFixed(2) ?? 0}}</span>
        <span class="text-base"><b class="text-xl">Bounding box size:</b> ({{ boundingBoxSize?.x.toFixed(2) ?? 0}}, {{ boundingBoxSize?.y.toFixed(2) ?? 0}}, {{ boundingBoxSize?.z.toFixed(2) ?? 0}})</span>
      </div>
      <v-btn type="submit" block class="mt-2">Submit</v-btn>
    </v-form>
  </div>
</template>

<script>
  import * as THREE from 'three';

  export default {
    name: 'HomePrinting',
    components: {},
    data: () => ({
      rules: [
        value => {
          if (value) return true

          return "Field can't be left empty"
        },
      ],
      firstName: null,
      lastName: null,
      id: null,
      file: null,
      volume: null,
      boundingBoxSize: null,
      choosen_unit: "Millimeter",
      units: ["Millimeter", "Meter"]
    }),
    mounted() {
    },
    methods: {
      test(e) {
        if(!e) return;

        const read = new FileReader();
        read.readAsBinaryString(e);

        read.onloadend = () => {
          if(read.result) {
            const binaryContents = read.result // Your binary contents here
            const arrayBuffer = this.binaryStringToArrayBuffer(binaryContents);
            this.parseBinarySTL(arrayBuffer);

            const res = 0.1;
            const layerTime = 16;

            const volume = this.volume * (10e-4);
            const base = Math.ceil((this.boundingBoxSize.x * this.boundingBoxSize.y)/(100));
            const setUp = 5;
            const printHours = ((this.boundingBoxSize.z / res) * layerTime) / (3600);

            const price = volume*0.4 +(base/196)*(setUp*2+2) + 3*(printHours/30);

            console.log({volume, base, printHours, price, layers: (this.boundingBoxSize.z / res)});
          }
        }
      },
      parseBinarySTL(data) {
        const geometry = new THREE.BufferGeometry();
        const vertices = [];

        const dv = new DataView(data);
        let offset = 80; // Skip the header (80 bytes)

        // Read the number of triangles (faces)
        const numTriangles = dv.getUint32(offset, true);
        offset += 4;

        for (let i = 0; i < numTriangles; i++) {
          // Skip the normal vector (12 bytes)
          offset += 12;

          // Read the vertices (3 * 12 bytes)
          for (let j = 0; j < 3; j++) {
            const x = dv.getFloat32(offset, true);
            const y = dv.getFloat32(offset + 4, true);
            const z = dv.getFloat32(offset + 8, true);

            vertices.push(x, y, z);
            offset += 12;
          }

          // Skip the attribute byte count (2 bytes)
          offset += 2;
        }

        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        const mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial());

        // Calculate volume
        this.volume = this.calculateVolume(mesh);

        // Calculate bounding box size
        const boundingBox = new THREE.Box3().setFromObject(mesh);
        this.boundingBoxSize = boundingBox.getSize(new THREE.Vector3());
      },
      calculateVolume(mesh) {
        const geometry = mesh.geometry;
        const position = geometry.attributes.position.array;
        const indices = geometry.index ? geometry.index.array : null;

        let volume = 0;
        let vA, vB, vC;
        const pA = new THREE.Vector3();
        const pB = new THREE.Vector3();
        const pC = new THREE.Vector3();

        if (indices) {
          let iA, iB, iC;
          for (let i = 0; i < indices.length; i += 3) {
            iA = indices[i];
            iB = indices[i + 1];
            iC = indices[i + 2];

            vA = this.getVertex(iA, position, pA);
            vB = this.getVertex(iB, position, pB);
            vC = this.getVertex(iC, position, pC);

            volume += this.signedVolumeOfTriangle(vA, vB, vC);
          }
        } else {
          for (let i = 0; i < position.length; i += 9) {
            vA = this.getVertex(i, position, pA);
            vB = this.getVertex(i + 3, position, pB);
            vC = this.getVertex(i + 6, position, pC);

            volume += this.signedVolumeOfTriangle(vA, vB, vC);
          }
        }

        return Math.abs(volume);
      },
      getVertex(index, position, target) {
        target.x = position[index];
        target.y = position[index + 1];
        target.z = position[index + 2];
        return target;
      },
      signedVolumeOfTriangle(p1, p2, p3) {
        return p1.dot(p2.cross(p3)) / 6;
      },
      binaryStringToArrayBuffer(binaryString) {
        const buffer = new ArrayBuffer(binaryString.length);
        const bufferView = new Uint8Array(buffer);
        for (let i = 0; i < binaryString.length; i++) {
          bufferView[i] = binaryString.charCodeAt(i);
        }
        return buffer;
      },
      convertHeaderToHex(binaryContents) {
        var headerBytes = binaryContents.slice(0, 80);
        console.log(headerBytes)
        var hex = "";

        for (var i = 0; i < headerBytes.length; i++) {
          var byte = headerBytes[i];
          var hexValue = byte.toString(16).padStart(2, "0");
          hex += hexValue;
        }

        return hex;
      }
    },
  };
  </script>
