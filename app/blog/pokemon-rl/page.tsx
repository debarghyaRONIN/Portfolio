"use client";

import React, { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import CodeSnippet from '@/components/sub/CodeSnippet';
import BlogPostSkeleton from '@/components/sub/BlogPostSkeleton';
import ReadingProgress from '@/components/sub/ReadingProgress';
import TableOfContents from '@/components/sub/TableOfContents';
import { calculateReadingTime } from '@/utils/blogUtils';
import { motion } from 'framer-motion';

const PokemonRLBlog = () => {
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDarkMode(savedTheme === 'dark' || (!savedTheme && prefersDark));
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    localStorage.setItem('theme', !isDarkMode ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark');
  };

  // Example code snippets
  const environmentSetupCode = `import gymnasium as gym
from stable_baselines3 import PPO
from stable_baselines3.common.vec_env import DummyVecEnv
import pyboy

class PokemonRedEnv(gym.Env):
    def __init__(self):
        super().__init__()
        # Define action and observation spaces
        self.action_space = gym.spaces.Discrete(8)  # Up, Down, Left, Right, A, B, Start, Select
        self.observation_space = gym.spaces.Box(low=0, high=255, shape=(144, 160, 3))
        
        # Initialize PyBoy emulator
        self.pyboy = pyboy.PyBoy('pokemon_red.gb')
        self.pyboy.set_emulation_speed(0)

    def reset(self):
        # Reset the game state
        self.pyboy.reset()
        return self._get_observation()

    def step(self, action):
        # Execute action and get new state
        reward = self._execute_action(action)
        observation = self._get_observation()
        done = self._check_if_done()
        return observation, reward, done, {}`;

  const trainingCode = `# Create and wrap the environment
env = DummyVecEnv([lambda: PokemonRedEnv()])

# Initialize the agent
model = PPO('CnnPolicy', 
           env,
           verbose=1,
           learning_rate=0.0003,
           n_steps=2048,
           batch_size=64,
           n_epochs=10,
           gamma=0.99)

# Train the agent
model.learn(total_timesteps=1000000)

# Save the trained model
model.save("pokemon_red_agent")`;

  const evaluationCode = `# Load the trained model
model = PPO.load("pokemon_red_agent")

# Create evaluation environment
eval_env = PokemonRedEnv()

# Run evaluation episodes
episodes = 10
for episode in range(episodes):
    obs = eval_env.reset()
    done = False
    total_reward = 0
    
    while not done:
        action, _ = model.predict(obs)
        obs, reward, done, _ = eval_env.step(action)
        total_reward += reward
        
    print(f"Episode {episode + 1} reward: {total_reward}")`;

  // Calculate reading time
  const content = `
    ${environmentSetupCode}
    ${trainingCode}
    ${evaluationCode}
    Training an AI to play Pokémon Red is a fascinating application of reinforcement learning that combines classic gaming 
    with modern AI techniques. We'll use Python, Stable-Baselines3 for the RL algorithms, and PyBoy for Game Boy emulation. 
    This combination allows us to train an agent that can learn to navigate the game world, battle Pokémon, and progress through the story.
    // ...rest of the article content...
  `;
  
  const readingTime = calculateReadingTime(content);

  const tableOfContentsItems = [
    { title: "Introduction", href: "#introduction" },
    { title: "Environment Setup", href: "#environment-setup" },
    { title: "Training the Agent", href: "#training" },
    { title: "Evaluation", href: "#evaluation" },
    { title: "Conclusion", href: "#conclusion" }
  ];

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-gray-900' : 'bg-white'}`}>
      <ReadingProgress />
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/blog" className="flex items-center space-x-2">
              <span className="text-xl font-bold text-gray-900 dark:text-white">← Back to Blog</span>
            </Link>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
              aria-label="Toggle theme"
            >
              {isDarkMode ? '🌞' : '🌙'}
            </button>
          </div>
        </div>
      </nav>

      <Suspense fallback={<BlogPostSkeleton />}>
        <main className="max-w-[2000px] mx-auto">
          <article className="grid grid-cols-12 gap-8">
            {/* Main Content */}
            <div className="col-span-12 lg:col-span-8 xl:col-span-9 px-4 sm:px-6 lg:px-8 py-8">
              <header className="mb-12">
                <div className="space-y-4">
                  <nav aria-label="Breadcrumb" className="text-sm">
                    <ol className="flex items-center space-x-2">
                      <li><Link href="/" className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">Home</Link></li>
                      <li className="text-gray-500 dark:text-gray-400">/</li>
                      <li><Link href="/blog" className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">Blog</Link></li>
                      <li className="text-gray-500 dark:text-gray-400">/</li>
                      <li className="text-gray-900 dark:text-white">Pokemon RL</li>
                    </ol>
                  </nav>
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <span className="px-2.5 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">Reinforcement Learning</span>
                    <span>•</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">Python</span>
                    <span>•</span>
                    <time dateTime="2024-05-04">May 4, 2024</time>
                    <span>•</span>
                    <span>{readingTime} min read</span>
                  </div>
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-green-600 via-blue-500 to-purple-500 dark:from-green-400 dark:via-blue-400 dark:to-purple-400">
                    Training an AI to Play Pokémon Red Using Reinforcement Learning
                  </h1>
                  <meta name="description" content="Learn how to implement a reinforcement learning agent that can play Pokémon Red using Python, Stable-Baselines3, and PyBoy emulator. This guide covers environment setup, training, and evaluation." />
                </div>
              </header>

              <div className="prose prose-lg dark:prose-invert max-w-none">
                <section id="introduction" className="mb-12">
                  <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Introduction</h2>
                  <p className="mb-6 text-gray-700 dark:text-gray-300 leading-relaxed">
                    In this project, we'll explore how to create an AI agent capable of playing Pokémon Red using reinforcement learning. 
                    We'll use Python, Stable-Baselines3 for the RL algorithms, and PyBoy for Game Boy emulation. This combination allows 
                    us to train an agent that can learn to navigate the game world, battle Pokémon, and progress through the story.
                  </p>
                  <div className="relative aspect-video rounded-xl overflow-hidden mb-8 shadow-xl">
                    <Image
                      src="/red.jpg"
                      alt="Pokemon Red Screenshot showing a battle scene"
                      fill
                      className="object-cover"
                      priority
                    />
                  </div>
                </section>

                <section id="environment-setup" className="mb-12">
                  <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Environment Setup</h2>
                  <p className="mb-6 text-gray-700 dark:text-gray-300 leading-relaxed">
                    First, we need to create a custom Gym environment that wraps the Pokémon Red game. This environment will handle 
                    the interaction between our RL agent and the game, including action execution and reward calculation.
                  </p>
                  <CodeSnippet
                    code={environmentSetupCode}
                    language="python"
                    fileName="pokemon_env.py"
                    description="Custom Gym environment for Pokemon Red that handles game state management and reward calculation. Uses PyBoy for Game Boy emulation."
                  />
                </section>

                <section id="training" className="mb-12">
                  <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Training the Agent</h2>
                  <p className="mb-6 text-gray-700 dark:text-gray-300 leading-relaxed">
                    With our environment set up, we can now create and train our RL agent. We'll use PPO (Proximal Policy Optimization) 
                    from Stable-Baselines3, which is well-suited for this type of environment.
                  </p>
                  <CodeSnippet
                    code={trainingCode}
                    language="python"
                    fileName="train.py"
                    description="Training script that initializes and trains the PPO agent. Includes hyperparameter configuration for optimal learning."
                  />
                </section>

                <section id="evaluation" className="mb-12">
                  <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Evaluation</h2>
                  <p className="mb-6 text-gray-700 dark:text-gray-300 leading-relaxed">
                    After training, we need to evaluate our agent's performance. The following code demonstrates how to load a trained 
                    model and run evaluation episodes.
                  </p>
                  <CodeSnippet
                    code={evaluationCode}
                    language="python"
                    fileName="evaluate.py"
                    description="Evaluation script to test the trained agent's performance across multiple episodes. Tracks rewards and success metrics."
                  />
                </section>

                <section id="conclusion">
                  <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Conclusion</h2>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    Training an AI to play Pokémon Red is a fascinating application of reinforcement learning that combines classic gaming 
                    with modern AI techniques. While the training process can be computationally intensive and time-consuming, the 
                    resulting agent can learn complex strategies for game progression and battle tactics.
                  </p>
                </section>
              </div>
            </div>

            {/* Table of Contents Sidebar */}
            <aside className="hidden lg:block lg:col-span-4 xl:col-span-3 pt-8">
              <TableOfContents items={tableOfContentsItems} />
            </aside>
          </article>

          {/* Author Bio */}
          <footer className="border-t border-gray-200 dark:border-gray-800 mt-16">
            <div className="max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <div className="flex items-center space-x-6">
                <Image
                  src="/DebarghyaProfile.jpg"
                  alt="Debarghya Saha"
                  width={64}
                  height={64}
                  className="rounded-full"
                />
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Debarghya Saha</h3>
                  <p className="text-gray-600 dark:text-gray-400">ML Engineer & Reinforcement Learning Enthusiast</p>
                </div>
              </div>
            </div>
          </footer>
        </main>
      </Suspense>
    </div>
  );
};

export default PokemonRLBlog;