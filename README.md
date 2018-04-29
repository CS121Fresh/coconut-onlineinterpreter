# Coconut Online Interpreter

Coconut is a functional programming language that compiles to Python. This project aims to build an online interpreter for Coconut, which allows users to execute and save Coconut code. Since all valid Python is valid Coconut, this website can also serve as an online Python interpreter. There is no installation needed. You can write and test their code easily in our website with syntax highlighting and error messages. You can also download your code as either a Coconut file, or a compiled Python file.

Project website: http://coconutpl.s3-website.us-east-2.amazonaws.com/

### Components 
* Website (in this repo)
* [a link](https://github.com/CS121Fresh/compiler) Code Compiler
* [a link](https://github.com/CS121Fresh/runner) Code Runner 

## Architecture


<img align="center" width="450" alt="architecture" src="https://user-images.githubusercontent.com/22512348/39403526-185b1c12-4b33-11e8-81e4-774c1f27b8eb.png">

* Front-end is hosted on AWS S3
* Back-end is hosted on AWS lambda. It compiles and runs code, then return either output or error message
* S3 makes API call to lambda through API Gateway


### Prerequisites

Our interpreter require Python 3. 

## Installation
??? (Ask Prof. Kate) 

## Functionality

* __Executing Coconut code__: Users can click run or use Ctrl + R/cmd + R to run their Coconut code
* __Saving Coconut file__: Users can click save or use Ctrl + S/ cmd + S to save their Coconut code
* __Saving Compiled Python code__: Users can check the “Save as Python” box, and then click Ctrl + S/ cmd + S to save the compiled python code
* __Displaying error messages__: If user code fails to execute, our console will return an error message indicating the specific error, error type, and line number where the error occurs

## Known Problems

* __Cold Start__: AWS lambda has an issue with cold start, so if the server is not used in around 40 min, lambda will become inactive, and results a slow runtime for next execution. A possible solution is to build a serverless back end that calls our server every 20 min. This is still in implementation

* __Interactive code__: We currently do not support code that takes in user inputs


## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D
