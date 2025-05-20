"use client";

import React, { Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import CodeSnippet from '@/components/sub/CodeSnippet';
import BlogPostSkeleton from '@/components/sub/BlogPostSkeleton';
import ReadingProgress from '@/components/sub/ReadingProgress';
import TableOfContents from '@/components/sub/TableOfContents';
import { calculateReadingTime } from '@/utils/blogUtils';

const RealtimeObjectDetectionBlog = () => {
  // Example code snippets
  const modelSetupCode = `import torch
import torchvision
from torchvision.models.detection import fasterrcnn_resnet50_fpn
from torchvision.transforms import functional as F

def load_model(num_classes=91):  # COCO dataset has 91 classes
    # Load pre-trained model
    model = fasterrcnn_resnet50_fpn(pretrained=True)
    
    # Set to evaluation mode
    model.eval()
    
    # Move to GPU if available
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    model = model.to(device)
    
    return model, device`;

  const videoProcessingCode = `import cv2
import numpy as np

def process_video_stream(model, device):
    # Initialize video capture
    cap = cv2.VideoCapture(0)  # Use 0 for webcam
    
    while True:
        ret, frame = cap.read()
        if not ret:
            break
            
        # Convert frame to tensor
        img_tensor = F.to_tensor(frame).to(device)
        
        # Get predictions
        with torch.no_grad():
            predictions = model([img_tensor])
            
        # Process predictions
        boxes = predictions[0]['boxes'].cpu().numpy()
        scores = predictions[0]['scores'].cpu().numpy()
        labels = predictions[0]['labels'].cpu().numpy()
        
        # Draw boxes for high-confidence predictions
        for box, score, label in zip(boxes, scores, labels):
            if score > 0.7:  # Confidence threshold
                x1, y1, x2, y2 = box.astype(int)
                cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
                cv2.putText(frame, f'{COCO_CLASSES[label]}: {score:.2f}',
                          (x1, y1-10), cv2.FONT_HERSHEY_SIMPLEX,
                          0.9, (0, 255, 0), 2)
                
        # Display frame
        cv2.imshow('Real-time Object Detection', frame)
        
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break
    
    cap.release()
    cv2.destroyAllWindows()`;

  const optimizationCode = `# TensorRT Optimization
import torch2trt

def optimize_model(model, input_shape=(1, 3, 480, 640)):
    # Create example input
    x = torch.ones(input_shape).cuda()
    
    # Convert to TensorRT
    model_trt = torch2trt.torch2trt(
        model, 
        [x],
        fp16_mode=True,
        max_workspace_size=1 << 25
    )
    
    return model_trt

# Enable CUDA graph for faster inference
def create_cuda_graph(model, input_shape):
    static_input = torch.zeros(input_shape, device='cuda')
    
    # Warm up
    for _ in range(5):
        model(static_input)
    
    # Create CUDA graph
    s = torch.cuda.Stream()
    s.wait_stream(torch.cuda.current_stream())
    with torch.cuda.stream(s):
        static_output = model(static_input)
    torch.cuda.current_stream().wait_stream(s)
    
    # Capture graph
    g = torch.cuda.CUDAGraph()
    with torch.cuda.graph(g):
        static_output = model(static_input)
    
    return g, static_input, static_output`;

  // Calculate reading time
  const content = `
    ${modelSetupCode}
    ${videoProcessingCode}
    ${optimizationCode}
    Real-time object detection is a crucial computer vision task with applications ranging from surveillance 
    to autonomous vehicles. In this tutorial, we'll build a real-time object detection system using PyTorch 
    and the Faster R-CNN architecture, optimized for performance using TensorRT and CUDA graphs.
  `;

  const readingTime = calculateReadingTime(content);

  const tableOfContentsItems = [
    { title: "Introduction", href: "#introduction" },
    { title: "Model Setup", href: "#model-setup" },
    { title: "Video Processing", href: "#video-processing" },
    { title: "Performance Optimization", href: "#optimization" },
    { title: "Conclusion", href: "#conclusion" }
  ];

  return (
    <div className="min-h-screen bg-gray-900">
      <ReadingProgress />
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-gray-900/80 border-b border-gray-800">
        <div className="max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/blog" className="flex items-center space-x-2">
              <span className="text-xl font-bold text-white">← Back to Blog</span>
            </Link>
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
                      <li><Link href="/" className="text-gray-400 hover:text-gray-300">Home</Link></li>
                      <li className="text-gray-400">/</li>
                      <li><Link href="/blog" className="text-gray-400 hover:text-gray-300">Blog</Link></li>
                      <li className="text-gray-400">/</li>
                      <li className="text-white">Object Detection</li>
                    </ol>
                  </nav>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <span className="px-2.5 py-0.5 rounded-full bg-purple-900/30 text-purple-400">Computer Vision</span>
                    <span>•</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-900/30 text-blue-400">PyTorch</span>
                    <span>•</span>
                    <span>{readingTime} min read</span>
                    <span>•</span>
                    <time dateTime="2024-05-04">May 4, 2024</time>
                  </div>
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-blue-400 to-indigo-400">
                    Building a Real-time Object Detection System with PyTorch
                  </h1>
                  <meta name="description" content="Learn how to implement real-time object detection using PyTorch and OpenCV. This comprehensive guide covers model setup, video processing, and performance optimization techniques." />
                </div>
              </header>

              <div className="prose prose-invert max-w-none">
                <section id="introduction" className="mb-12">
                  <h2 className="text-3xl font-bold mb-6 text-white">Introduction</h2>
                  <p className="mb-6 text-gray-300 leading-relaxed">
                    Real-time object detection is a crucial computer vision task with applications ranging from surveillance 
                    to autonomous vehicles. In this tutorial, we'll build a real-time object detection system using PyTorch 
                    and the Faster R-CNN architecture, optimized for performance using TensorRT and CUDA graphs.
                  </p>
                  <div className="relative aspect-video rounded-xl overflow-hidden mb-8 shadow-xl">
                    <Image
                      src="/5296765_camera_instagram_instagram logo_icon.png"
                      alt="Real-time object detection demo showing multiple objects being detected in a video stream"
                      fill
                      className="object-cover"
                      priority
                    />
                  </div>
                </section>

                <section id="model-setup" className="mb-12">
                  <h2 className="text-3xl font-bold mb-6 text-white">Model Setup</h2>
                  <p className="mb-6 text-gray-300 leading-relaxed">
                    We'll start by setting up our model using a pre-trained Faster R-CNN with ResNet-50 backbone. This model 
                    provides a good balance between accuracy and speed for real-time applications.
                  </p>
                  <CodeSnippet
                    code={modelSetupCode}
                    language="python"
                    fileName="model_setup.py"
                    description="Initialize a pre-trained Faster R-CNN model with ResNet-50 backbone and configure it for inference. The model is moved to GPU if available for faster processing."
                  />
                </section>

                <section id="video-processing" className="mb-12">
                  <h2 className="text-3xl font-bold mb-6 text-white">Video Processing</h2>
                  <p className="mb-6 text-gray-300 leading-relaxed">
                    Once our model is set up, we can process video streams in real-time. We'll use OpenCV to capture video 
                    frames and display the results with bounding boxes and labels.
                  </p>
                  <CodeSnippet
                    code={videoProcessingCode}
                    language="python"
                    fileName="video_processing.py"
                    description="Real-time video processing pipeline that captures frames, performs object detection, and visualizes results. Includes confidence thresholding for reliable detections."
                  />
                </section>

                <section id="optimization" className="mb-12">
                  <h2 className="text-3xl font-bold mb-6 text-white">Performance Optimization</h2>
                  <p className="mb-6 text-gray-300 leading-relaxed">
                    To achieve real-time performance, we'll optimize our model using TensorRT and CUDA graphs. These 
                    optimizations can significantly improve inference speed on NVIDIA GPUs.
                  </p>
                  <CodeSnippet
                    code={optimizationCode}
                    language="python"
                    fileName="optimization.py"
                    description="Advanced optimization techniques using TensorRT for model quantization and CUDA graphs for faster inference. These optimizations can provide up to 3x speedup in inference time."
                  />
                </section>

                <section id="conclusion">
                  <h2 className="text-3xl font-bold mb-6 text-white">Conclusion</h2>
                  <p className="text-gray-300 leading-relaxed">
                    Building a real-time object detection system requires careful consideration of both model accuracy and 
                    performance optimizations. By using PyTorch's ecosystem and NVIDIA's acceleration tools, we can create 
                    a system that's both accurate and fast enough for real-world applications.
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
          <footer className="border-t border-gray-800 mt-16">
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
                  <h3 className="text-xl font-semibold text-white">Debarghya Saha</h3>
                  <p className="text-gray-400">ML Engineer & Computer Vision Specialist</p>
                </div>
              </div>
            </div>
          </footer>
        </main>
      </Suspense>
    </div>
  );
};

export default RealtimeObjectDetectionBlog;