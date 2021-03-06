
 <div id="resume">

<img src="images/cpp.png" class="resume-logo" />
<img src="images/java.png" class="resume-logo" />
<img src="images/mysql.png" class="resume-logo" />
<img src="images/git.png" class="resume-logo" />
<img src="images/svn.png" class="resume-logo" />
<img src="images/linux.png" class="resume-logo" />
<img src="images/vim.png" class="resume-logo" />
<img src="images/php.png" class="resume-logo" />
<img src="images/javascript.png" class="resume-logo" />
<img src="images/android.png" class="resume-logo" />
<img src="images/perl.png" class="resume-logo" />
<img src="images/directx.png" class="resume-logo" />
<img src="images/opengl.png" class="resume-logo" />


##Resume


###Contact Details

  * Email: poltavsky.alexandr&#64;gmail.com

  * Phone: +7 (964) 791-19-61


###Summary

  I'm looking for a job that is mostly about C++ and computer graphics. I have been interested 
  in computers since I was young and over time acquired a good understanding of computer 
  architecture, data structures and algorithms. Another my passion is computer graphics. 
  I have experience developing DirectX and OpenGL applications. I'm really interested in 
  **computer graphics research** and have developed an anti-aliasing algorithm called DFAA. 
  Also I have a couple publications with WebGL demos ( links are in the Projects and Publications 
  sections ).


###Technical Skills

  * Great C++ (C++11/C++14) skills
  * Working knowledge of the Standard Template Library (STL)
  * Desktop application development in C++ using Win32 APIs, OpenGL and DirectX
  * Good knowledge of the DirectX 9, DirectX 11 и OpenGL APIs
  * Worked a lot with HLSL и GLSL, experimented with compute shaders
  * Have a good understanding of the GPU architecture and the graphics pipeline
  * Server side programming in C++ and PHP, a bit of Perl
  * Good SQL skills, primary database was MySQL, familiar with Postgres
  * Worked with JavaScript (including WebGL), HTML, XML
  * Good understanding of classic multithreaded and lock-free programming
  * Able to look into assembly output and optimize for speed
  * Good math skills (linear algebra, calculus, trigonometry)
  * Worked with SVN and GIT, used to Bash and Linux


###Work Experience

* **MAIR Industrial Group, Russia, Moscow, August 2004 - December 2005**

  Position: Software Engineer

  Support of an internal database client application written in C++. Fixed bugs and improved GUI.


* **RBC Media, Russia, Moscow, December 2005 - June 2008**

  Position: Software Engineer, later Senior Software Engineer

  Development of web applications based on Apache, PHP (and a bit of Perl), MySQL stack. Building 
  interfaces in HTML, CSS and JavaScript.

  Development of an extension module in C++ for Apache server to gather stats.

  During my last year at the company was leading a small group of developers (3 people).


* **Human Stem Cells Institute, Russia, Moscow, August 2008 - May 2011**

  Position: Software Engineer

  Worked on an internal project to develop an OpenGL 3D computer program to demonstrate to clients
  the effects of cosmetic injections. The primary tool was Visual C++ using Win32 API.


* **Independent software Developer since 2011 up to now**

  Took a break from active career to try to develop personal projects. Tried to develop a 
  CMS (Content Management System) and launch a news web site, took part-time gigs, later 
  developed a Java app for Google Play Store (Color Throne). Recently was involved in a project
  with the Institute of Control Sciences of the Russian Academy of Sciences to develop a C++
  application for visualizing data in 3D.

  Was also working on improving my C++. Got a pretty good grasp of the new C++11 standard. Has 
  started a 3D demo engine ( Flower3D ) for which I've created a math lib and my mini-STL 
  ( things like std::vector, std::unordered\_map, type\_traits etc. ).

  As I was researching ideas I came up with a C++ reflection technique described in my "The C++
  Type Loophole" blog post (compile time solution, no macros).

  Got interested in lock-free programming and came up with a lock-free data structure 
  *atomic\_data* ( links are in the **Projects** section ).
  

###Education

  Mathematics and Informatics, Moscow Engineering Physics Institute (MEPhi), not complete.


###Certificates

  * [Mail.ru C++ Gold Certificate](https://certification.mail.ru/certificates/d7f3561b-7cda-44b7-9110-1b0fc35f0285/en/)
  
  * [Zend Certified Engineer](http://www.zend.com/en/yellow-pages/ZEND004080) (LAMP software stack)


###Publications ( computer graphics )

  * [Dynamic Lighting using Primitive ID: Lessons Learned](http://alexpolt.github.io/lenin-bright.html)
    
    Got an idea to implement dynamic lighting per face with the help of gl_PrimitiveID. 
    I describe my experience dealing with artifacts and lessons learned about lighting with many 
    lights. At the end there is a **WebGL demo**.

  * [Shader Tricks: Retrieving Triangle Location and Edges in Pixel Shader and More](http://alexpolt.github.io/shader.html)

    There are cases when we need full triangle info in a pixel shader and I describe the easy and 
    cheap way of getting it. Also talk about using partial derivatives for peeking into another 
    shader and non perspective interpolation in WebGL. A **WebGL demo** is provided.

  * [Barycentric Coordinates](http://alexpolt.github.io/barycentric.html)  

    It's important to understand barycentric coordinates for graphics programmers. JavaScript demo.


###Publications ( C++ )

  * [The C++ Type Loophole](http://alexpolt.github.io/type-loophole.html)

    This C++ hack allows to do reflection of aggregate types in compile time without macros.

  * [nuple: a Named Tuple](http://alexpolt.github.io/named-tuple.html)

    Having a tuple with name tags reduces programming errors.

  * [Undefined Behaviour and Optimizations: GCC vs Clang vs MSC](http://alexpolt.github.io/undefined.html)

    I explore assembly output of different compilers to show how undefined behaviour and 
    compiler optimization affect generated assembly.

  * Check my [personal blog](http://alexpolt.github.io/) for more.


###Projects ( GitHub )

  * [Introducing DFAA anti-aliasing algorithm](https://github.com/alexpolt/DFAA)

    In this article I present an anti-aliasing technique - DFAA. There are HLSL code and a 
    Render Monkey project. Also a link to a blog post with detailed description.

  * [Flower3D](https://github.com/alexpolt/flower3d)

    My shot at 3D (demo) engines. Work in progress.

  * [ColorThrone - Brain Gymnastics (an Android game)](https://github.com/alexpolt/colorthrone)

    A simple match 3 game with some Tetris elements written in Java.

  * [luple, nuple, Struct Reader and C++ Type Loophole](https://github.com/alexpolt/luple)

    luple is an almost complete std::tuple implementation. nuple builds on it and adds name
    tagging to data. Struct Reader allows reflection of aggregates for simple cases. And
    C++ Type Loophole allows reflection for aggregates containing any types. Code plus online
    samples.

  * [atomic\_data: A Multibyte General Purpose Lock-Free Data Structure](https://github.com/alexpolt/atomic_data)

    atomic_data is a general-purpose lock-free data structure which allows to read and update
    data structures of any size atomically and in a lock-free manner. Nice API and good performance.


###Language Skills

  * Native Russian

  * Advanced English


<div style="clear: both;"></div>

 </div>

<div style="height: 178px"></div>

