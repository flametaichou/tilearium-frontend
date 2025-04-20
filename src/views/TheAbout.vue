<template>
    <div class="about">
        <div class="about__logo">
            <img src="@/assets/logo.png">
        </div>

        <div class="about_description text-white ">
            <strong>WorldSim</strong> - is a game where you need to find something in a simulated world
        </div>
    </div>
</template>


<style scoped lang="scss">

.about {
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    &__form {
    }

    &__description {
        margin-top: 16px;
    }

    &__actions {
        margin-top: 16px;
    }
}
</style>