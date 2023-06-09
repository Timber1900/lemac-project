<template>
  <div class="flex flex-col items-start justify-start w-full">
    <h2 class="m-6 text-4xl font-semibold">SOLIDWORKS 2022</h2>
    <span class="indent-12">
      <span class="text-xl font-medium">Download URL: </span>
      <a :href='url'>{{ url }}</a>
    </span>
    <span class="indent-12">
      <span class="text-xl font-medium">Serial Number: </span>
      {{ serial }}
    </span>
    <h3 class="m-4 text-3xl font-medium">Installation Steps:</h3>
    <div class="grid w-full grid-cols-5 grid-rows-1 h-[40vh]">
      <div class="flex flex-col items-center justify-start col-span-2 ">
        <p class="my-auto text-lg indent-4">
          <span v-html="installInstructions[currentPlace]"/>
        </p>
        <div class="flex items-center justify-start w-full align-bottom max-h-12">
          <v-icon v-if="currentPlace > 0" class="transition-transform duration-200 scale-100 hover:scale-125 active:scale-95" large @click="() => this.currentPlace--">mdi-menu-left</v-icon>
          <v-icon disabled v-if="currentPlace <= 0" class="transition-transform duration-200 scale-100 hover:scale-125 active:scale-95" large>mdi-menu-left</v-icon>

          <v-icon v-if="currentPlace < installInstructions.length-1" class="transition-transform duration-200 scale-100 hover:scale-125 active:scale-95" large @click="() => this.currentPlace++">mdi-menu-right</v-icon>

          <v-icon v-if="currentPlace >= installInstructions.length-1" class="transition-transform duration-200 scale-100 hover:scale-125 active:scale-95" large disabled>mdi-menu-right</v-icon>

        </div>
      </div>
      <div class="flex items-center col-span-3 p-2">
        <img class="object-contain mx-auto rounded-md shadow-md max-h-[40vh]" :src="installPhotos[currentPlace]">
      </div>
    </div>
  </div>
</template>

<script>
  import photo1 from "@/../public/Solidworks/Solidworks_Step_1.png";
  import photo2 from "@/../public/Solidworks/Solidworks_Step_2.png";
  import photo3 from "@/../public/Solidworks/Solidworks_Step_3.png";
  import photo4 from "@/../public/Solidworks/Solidworks_Step_4.png";

  export default {
    name: 'Solidworks',
    components: {},
    props: {
    },
    data: () => ({
      url: null,
      serial: null,
      currentPlace: 0,
      installInstructions: [""],
      installPhotos: [photo1, photo2, photo3, photo4]
    }),
    mounted() {
      this.test();
    },
    methods: {
      test() {
        this.url = process.env.VUE_APP_SOLIDWORKS_URL;
        this.serial = process.env.VUE_APP_SOLIDWORKS_LICENSE;

        this.installInstructions = [
          `<p class="mb-0">The installation process has to be executed while connected to Eduroam on Tecnico's VPN. </p>
          <p>Go to the <a href='${process.env.VUE_APP_SOLIDWORKS_URL}'>Download URL</a> and insert your data and download the SOLIDWORKS 2022 installer.</p>`,
          "Execute the install executable and insert the serial number in the designated area. Make sure that there are no other serial numbers inserted.",
          "Remove 'SOLIDWORKS Eletrical' from the products to install",
          "Accept the license agreement and click the 'Download and Install' button"];
      }
    },
  };
  </script>
