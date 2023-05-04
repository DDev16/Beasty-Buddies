import React from 'react';
import PropTypes from 'prop-types';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import '../components/Slider.scss';

/**
 * SliderComponent is a React component that renders a responsive image slider
 * with customizable settings and styles using the 'react-slick' library.
 *
 * @param {Object[]} images - An array of image URLs to be displayed in the slider.
 */
const SliderComponent = ({ images }) => {
  // Slider configuration settings
  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true, // Add this line to enable autoplay
    autoplaySpeed: 3000,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
    appendDots: (dots) => (
      <div className="dots-wrapper">
        <ul className="dots-list"> {dots} </ul>
      </div>
    ),
    customPaging: () => (
      <div className="custom-paging">
        <span>.</span>
      </div>
    ),
    afterChange: (currentSlide) => {
      console.log(`Image changed to slide ${currentSlide + 1}`);
    },
  };

  return (
    <div className="slider-container">
      <Slider {...sliderSettings}>
        {images.map((image, index) => (
          <div key={index} className="slick-slide"> {/* Change the class name here */}
            <img src={image} alt={`NFT ${index}`} />
          </div>
        ))}
      </Slider>
    </div>
  );
}

SliderComponent.propTypes = {
  images: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default SliderComponent;
