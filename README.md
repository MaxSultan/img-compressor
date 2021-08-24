# img-compressor

Minify and resize images using lossy compression all on the front-end

## Visual Preview:

<a href="https://maxsultan.github.io/img-compressor/"><kbd><img src="https://user-images.githubusercontent.com/59545347/128049202-fdd104d8-d855-4319-baec-8beb14d7b6e7.png" /></kbd></a>

## This can be previewed here:

https://maxsultan.github.io/img-compressor/

## How it Works:

Canvas elements can be used to draw images via javascript. By default it does this using bilinear interpolation.

### Here are some basic definitions:

- Bilinear Interpolation uses a weighted average of the four nearest cell centers. The closer an input cell center is to the output cell center, the higher the influence of its value is on the output cell value. This means that the output value could be different than the nearest input, but is always within the same range of values as the input.

- BiCubic Interpolation looks at the 16 nearest cell centers to the output and fits a smooth curve through the points to find the value. Not only does this change the values of the input but it could also cause the output value to be outside of the range of input values (imagine a sink or a peak occurring on a surface).

## Implimented Features:

- upload an image
- view a preview of the compressed image
- see the image file size before and after compression
- download a compressed version of the image
- customize the quality of the compressed image
- customize the dimensions of the image
- chose to perserve or disregard the aspect ratio of the image
- copy an image and paste in onto the webpage to have it compressed
- drag and drop an image into a drop area to have it compressed

This is a demo project for an npm package I built called front-end-min:

the package can be viewed on NPM here: https://www.npmjs.com/package/front-end-min
