<template>
  <div class="flex flex-col items-start justify-start w-full">
    <h2 class="m-6 text-4xl font-semibold">Siemens NX 2212</h2>
    <span class="indent-12">
      <span class="text-xl font-medium">Download URL: </span>
      <a :href='url'>{{ url }}</a>
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
  import photo1 from "@/../public/Siemens_NX/NX_Step_1.png";
  import photo2 from "@/../public/Siemens_NX/NX_Step_2.png";
  import photo3 from "@/../public/Siemens_NX/NX_Step_3.png";
  import photo4 from "@/../public/Siemens_NX/NX_Step_4.png";

  export default {
    name: 'Siemens_NX',
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
        this.url = process.env.VUE_APP_NX_URL;

        this.installInstructions = [
          `<p class="mb-0">The installation process has to be executed while connected to Eduroam on Tecnico's VPN. </p>
          <p>Go to the <a href='${process.env.VUE_APP_NX_URL}'>Download URL</a> and download the instalation files.</p>`,
          `<p> Extract the download contents and open the folder 'SiemensNX-XXXX_wntx64' </p>
           <p> Run the file 'Launch.exe'</p>
          `,
          `<p>Click on 'Install NX', <b>DO NOT install the license server</b></p>
           <p>When prompted for the license server address, type "29000@ls.dem.tecnico.ulisboa.pt"</p>`,
          `<p>After the instalation process concludes edit the system environment variables and include the following: </p>
          <span>
            <b>Variable Name</b>: UGS_LICENSE_BUNDLE <br/>
            <b>Variable Value</b>: ACD10,ACD11
          </span>

          <p  class="mt-4"> Finish by restarting the PC</p>
          `];
      }
    },
  };
  </script>
