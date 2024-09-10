# Console App

In this tutorial you'll create an app that logs cat facts to the terminal.

> You can achieve the same result with fewer code, but the intent is to display the framework's features.

## Creating the project

In your preferred directory run the following command:

```bash
tomasjs init
```

> Choose the "Console App" template and name your project whatever you like. A directory with the specified project name will be created.

The following files will be created:

```txt
/your-project-name
    /node_modules
    /src
        app.ts
    .gitignore
    appconfig.json
    jest.config.ts
    package.json
    pnpm-lock.yaml
    tomasjs.json
    tsconfig.build.json
    tsconfig.json
```

## The app's configuration

In your app's configuration file (`appconfig.json`), place the following content:

```json
{
  "logging": {
    "default": {
      "level": "info"
    }
  },
  "meowfacts": {
    "url": "https://meowfacts.herokuapp.com",
    "count": 3
  },
  "catEmojis": ["🐱", "😸", "😸", "😻", "😼", "😽", "😿", "😾"]
}
```

## Importing the required modules

In the `src/app.ts` file import the following modules:

```ts
// src/app.ts

import "reflect-metadata";
import { CONFIGURATION, IConfiguration } from "@tomasjs/core/configuration";
import { ConsoleAppBuilder } from "@tomasjs/core/console";
import { inject } from "@tomasjs/core/dependency-injection";
import { HttpClient } from "@tomasjs/core/http";
import { ILogger, LOGGER } from "@tomasjs/core/logging";
import { Message } from "@tomasjs/core/messaging";
import { IProcessor } from "@tomasjs/core/messaging/Processor";
import { ISender, SENDER } from "@tomasjs/core/messaging/Sender";
```

## The MeowFactsApi service

Create the `MeowFactsApi` service:

```ts
// src/app.ts

type MeowFactsOptions = {
  url: string;
  count: number;
};

class MeowFactsApi {
  private readonly options: MeowFactsOptions;
  private readonly client = new HttpClient();

  constructor(@inject(CONFIGURATION) config: IConfiguration) {
    this.options = config.sectionOrThrow("meowfacts").valueOrThrow("object");
  }

  async getRandomFacts(): Promise<string[]> {
    const requests = [...Array(this.options.count).keys()].map(async () => {
      const response = await this.client.getJson<{ data: [string] }>(this.options.url);
      return response.data[0];
    });

    return await Promise.all(requests);
  }
}
```

## The CatEmojiPicker service

Create the `CatEmojiPicker` service:

```ts
// src/app.ts

class CatEmojiPicker {
  private readonly emojis: string[];

  constructor(@inject(CONFIGURATION) config: IConfiguration) {
    this.emojis = config.sectionOrThrow("catEmojis").valueOrThrow<string[]>("object");
  }

  getRandomEmoji(): string {
    const min = 0;
    const max = this.emojis.length - 1;
    const index = Math.floor(Math.random() * (max - min + 1)) + min;
    return this.emojis[index];
  }
}
```

## The DisplayFactRequestProcessor service

Create the `DisplayFactRequestProcessor` service:

```ts
// src/app.ts

class DisplayFactsRequest implements Message {
  readonly type = DisplayFactsRequest.name;
  constructor(readonly facts: string[]) {}
}

class DisplayFactsProcessor implements IProcessor<DisplayFactsRequest> {
  constructor(
    @inject(CatEmojiPicker) private readonly emojiPicker: CatEmojiPicker,
    @inject(LOGGER) private readonly logger: ILogger
  ) {}

  async process(message: DisplayFactsRequest): Promise<void> {
    for (const fact of message.facts) {
      const emoji = this.emojiPicker.getRandomEmoji();
      this.logger.info(`${emoji} ${fact}`);
    }
  }
}
```

## Bootstrapping your application

Now lets build the console app:

```ts
// src/app.ts

new ConsoleAppBuilder()
  .setupConfiguration((config) => {
    // Add the configuration settings from the appconfig.json file
    config.addJsonSource();
  })
  .setupMessaging((messaging) => {
    // Register the message type and the processor for that type
    messaging.withProcessor(DisplayFactsRequest.name, DisplayFactsProcessor);
  })
  .setupContainer((container) => {
    // Register our custom services
    container.add("singleton", MeowFactsApi);
    container.add("singleton", CatEmojiPicker);
  })
  .addEntryPoint(async ({ services }) => {
    // This is where your application starts

    // get an instance of the MeowFactsApi service
    const meowFactsApi = services.getOrThrow(MeowFactsApi);

    // get an instance of the ISender messaging service
    const sender = services.getOrThrow<ISender>(SENDER);

    // get some random facts
    const facts = await meowFactsApi.getRandomFacts();

    // send the DisplayFactsRequest
    await sender.send(new DisplayFactsRequest(facts));
  })
  .build()
  .then((app) => app.start());
```

## Running the app

Run the app:

```bash
tomasjs dev
```

You will get an output similar to this:

```txt
00:22:10.757 INF 😾 Cats sleep 70% of their lives.
00:22:10.759 INF 😼 There are cats who have survived falls from over 32 stories (320 meters) onto concrete.
00:22:10.760 INF 😻 Some common houseplants poisonous to cats include: English Ivy, iris, mistletoe, philodendron, and yew.
```

## The complete program

The complete program looks like this:

```ts
// src/app.ts

import "reflect-metadata";
import { CONFIGURATION, IConfiguration } from "@tomasjs/core/configuration";
import { ConsoleAppBuilder } from "@tomasjs/core/console";
import { inject } from "@tomasjs/core/dependency-injection";
import { HttpClient } from "@tomasjs/core/http";
import { ILogger, LOGGER } from "@tomasjs/core/logging";
import { Message } from "@tomasjs/core/messaging";
import { IProcessor } from "@tomasjs/core/messaging/Processor";
import { ISender, SENDER } from "@tomasjs/core/messaging/Sender";

type MeowFactsOptions = {
  url: string;
  count: number;
};

class MeowFactsApi {
  private readonly options: MeowFactsOptions;
  private readonly client = new HttpClient();

  constructor(@inject(CONFIGURATION) config: IConfiguration) {
    this.options = config.sectionOrThrow("meowfacts").valueOrThrow("object");
  }

  async getRandomFacts(): Promise<string[]> {
    const requests = [...Array(this.options.count).keys()].map(async () => {
      const response = await this.client.getJson<{ data: [string] }>(this.options.url);
      return response.data[0];
    });

    return await Promise.all(requests);
  }
}

class CatEmojiPicker {
  private readonly emojis: string[];

  constructor(@inject(CONFIGURATION) config: IConfiguration) {
    this.emojis = config.sectionOrThrow("catEmojis").valueOrThrow<string[]>("object");
  }

  getRandomEmoji(): string {
    const min = 0;
    const max = this.emojis.length - 1;
    const index = Math.floor(Math.random() * (max - min + 1)) + min;
    return this.emojis[index];
  }
}

class DisplayFactsRequest implements Message {
  readonly type = DisplayFactsRequest.name;
  constructor(readonly facts: string[]) {}
}

class DisplayFactsProcessor implements IProcessor<DisplayFactsRequest> {
  constructor(
    @inject(CatEmojiPicker) private readonly emojiPicker: CatEmojiPicker,
    @inject(LOGGER) private readonly logger: ILogger
  ) {}

  async process(message: DisplayFactsRequest): Promise<void> {
    for (const fact of message.facts) {
      const emoji = this.emojiPicker.getRandomEmoji();
      this.logger.info(`${emoji} ${fact}`);
    }
  }
}

new ConsoleAppBuilder()
  .setupConfiguration((config) => {
    // Add the configuration settings from the appconfig.json file
    config.addJsonSource();
  })
  .setupMessaging((messaging) => {
    // Register the message type and the processor for that type
    messaging.withProcessor(DisplayFactsRequest.name, DisplayFactsProcessor);
  })
  .setupContainer((container) => {
    // Register our custom services
    container.add("singleton", MeowFactsApi);
    container.add("singleton", CatEmojiPicker);
  })
  .addEntryPoint(async ({ services }) => {
    // This is where your application starts

    // get an instance of the MeowFactsApi service
    const meowFactsApi = services.getOrThrow(MeowFactsApi);

    // get an instance of the ISender messaging service
    const sender = services.getOrThrow<ISender>(SENDER);

    // get some random facts
    const facts = await meowFactsApi.getRandomFacts();

    // send the DisplayFactsRequest
    await sender.send(new DisplayFactsRequest(facts));
  })
  .build()
  .then((app) => app.start());
```
