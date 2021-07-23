# img-compressor
This can be previewed here:  https://maxsultan.github.io/img-compressor/

How it Works:
Canvas elements can be used to draw images via javascript. By default it does this using bilinear interpolation. The canvas element has been updated to use a faux bi-cubic interpolation.  

Here are some basic definitions: 
- Bilinear Interpolation uses a weighted average of the four nearest cell centers. The closer an input cell center is to the output cell center, the higher the influence of its value is on the output cell value. This means that the output value could be different than the nearest input, but is always within the same range of values as the input.

- BiCubic Interpolation looks at the 16 nearest cell centers to the output and fits a smooth curve through the points to find the value. Not only does this change the values of the input but it could also cause the output value to be outside of the range of input values (imagine a sink or a peak occurring on a surface).


Implimented Features:
A user can upload an image 
A user can view a preview of the compressed image
A user can see the image file size before and after compression
A user can download a compressed version of the image
A user can customize the quality of the compressed image

Here are some questions I still have:
How does Bilinear Interpolation/BiCubic Interpolation work in compression instead of expansion? In expanding the image you need more data that you have, but in compression you already have all the data you need.
