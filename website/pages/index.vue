<script setup lang="ts">
  const router = useRouter();

  function onGetStartedClick() {
    router.push("/docs/first-app");
  }
</script>

<template>
  <div class="h-100 d-flex justify-content-center align-items-center border-bottom mb-5 px-5">
    <div>
      <!-- <h1 class="text-center">TomasJS</h1> -->
      <p class="text-center" style="font-size: 4rem">TomasJS</p>
      <p class="text-center" style="font-size: 1.1rem">
        Node.js applications how their supposed to be
      </p>
    </div>
  </div>

  <div class="container py-5">
    <section class="mb-5">
      <p style="font-size: 1.5rem">What is TomasJS?</p>

      <p>
        TomasJS is Node.js framework and a collection of libraries to develop extensible,
        maintainable and scalable applications.
      </p>

      <p>
        It's built with TypeScript and comes with out-of-the-box support for Dependency Injection,
        Configuration, Logging, Testing, and more.
      </p>
    </section>

    <section class="mb-5 pb-5">
      <p style="font-size: 1.5rem">Why TomasJS?</p>

      <p>
        Thanks to Node.js, developers are able to create server side applications in a programming
        language that the world didn't need: JavaScript.
      </p>

      <p>
        JavaScript is infamous for various reasons (<code>[] + [] == ''</code>). But it sure isn't
        famous for being a robust language. Regardless, if we're going to use JavaScript to create
        server side applications, we might at least do a good job at it.
      </p>

      <p>
        So TomasJS was born, and the idea of attempting to deliver the best developer experience
        while using the least recommended programming language for the job.
      </p>

      <p>
        TomasJS allows the developer to produce high quality code by using strict TypeScript, Object
        Oriented Programming (the good parts), but more importantly: a well designed architecture.
      </p>

      <p class="text-center mb-4">Ah yes, and it's named after my cat:</p>
      <div class="d-flex justify-content-center mb-2">
        <img src="~/assets/img/tomas.jpg" alt="Tomas" style="border-radius: 100%; width: 200px; height: 200px" />
      </div>
      <p class="m-0 text-center">
        <small>Tomas</small>
      </p>
    </section>

    <section class="mb-5 pb-5">
      <p class="text-center mb-5" style="font-size: 1.5rem">With TomasJS you can develop</p>

      <div class="row m-0 p-0">
        <div class="col-12 col-md-4 m-0 p-0 mb-5">
          <div>
            <p class="text-center m-0" style="font-size: 1.4rem">Console Apps</p>
            <p class="text-center m-0">
              <Icon name="terminal" size="3rem" />
            </p>
          </div>
        </div>
        <div class="col-12 col-md-4 m-0 p-0 mb-5">
          <div>
            <p class="text-center m-0" style="font-size: 1.4rem">Web APIs</p>
            <p class="text-center m-0">
              <Icon name="braces" size="3rem" />
            </p>
          </div>
        </div>
        <div class="col-12 col-md-4 m-0 p-0 mb-5">
          <div>
            <p class="text-center m-0" style="font-size: 1.4rem">Microservices</p>
            <p class="text-center m-0">
              <Icon name="boxes" size="3rem" />
            </p>
          </div>
        </div>
        <div class="col-12 col-md-4 m-0 p-0 mb-5">
          <div>
            <p class="text-center m-0" style="font-size: 1.4rem">Background Jobs</p>
            <p class="text-center m-0">
              <Icon name="cpu" size="3rem" />
            </p>
          </div>
        </div>
        <div class="col-12 col-md-4 m-0 p-0 mb-5">
          <div>
            <p class="text-center m-0" style="font-size: 1.4rem">Interactive CLIs</p>
            <p class="text-center m-0">
              <Icon name="command" size="3rem" />
            </p>
          </div>
        </div>
        <div class="col-12 col-md-4 m-0 p-0 mb-5">
          <div>
            <p class="text-center m-0" style="font-size: 1.4rem">Libraries</p>
            <p class="text-center m-0">
              <Icon name="box-seam" size="3rem" />
            </p>
          </div>
        </div>
      </div>
    </section>

    <section class="mb-5 pb-5">
      <p class="fw-bold text-center mb-4">Start developing now!</p>
      <div class="d-flex justify-content-center">
        <button
          class="btn btn-primary px-5 py-2"
          style="border-radius: 30px; font-size: 1.5rem"
          @click="onGetStartedClick"
        >
          Get Started
        </button>
      </div>
    </section>
  </div>
</template>
