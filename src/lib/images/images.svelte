<script lang="ts">
    import pic1 from "./mpg2_test1.png";
    import pic2 from "./mpg2_test2.png";
    import pic3 from "./mpg2_test3.png";

    export let im_index: number = 0;   
    const mp2_images = [
        pic1,
        pic2,
        pic3]
</script>

<img class="w-2/4" src={mp2_images[im_index]} alt="mp2_1" />