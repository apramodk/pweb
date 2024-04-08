<script lang="ts">
    import pic1 from "./mpg2_test1.png";
    import pic2 from "./mpg2_test2.png";
    import pic3 from "./mpg2_test3.png";
    import drone from "./drone.png";
    import img1 from "./img1.png";
    import img2 from "./img2.png";
    import img3 from "./img3.png";
    import img4 from "./img4.png";
    import img5 from "./img4.png";
    import img6 from "./img4.png";
    import img7 from "./img4.png";
    import mgp3_1 from "./mpg3_prototype1.png";
    import mgp3_2 from "./mpg3_prototype2.png";
    import mgp3_3 from "./mpg3_prototype3.png";
    import mgp3 from "./mgp3_glove.jpg"

    export let im_index: number = 0;   
    const mp2_images = [
        pic1,
        pic2,
        pic3,
        drone,
        img1,
        img2,
        img3,
        img4,
        img5,
        img6,
        img7,
        mgp3_1,
        mgp3_2,
        mgp3_3,
        mgp3]
</script>

<img class="w-2/4" src={mp2_images[im_index]} alt="mp2_1" />