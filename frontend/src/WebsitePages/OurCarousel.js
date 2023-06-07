import Carousel from 'react-bootstrap/Carousel';
import React from 'react';
import './OurCarousel.css';

import ship_1 from '../components/ship_1.jpg';
import ship_2 from '../components/ship_2.jpg';
import ship_3 from '../components/ship_3.jpg';
import ship_4 from '../components/ship_4.jpg';



export const OurCarousel = () => {

    return (
        <Carousel>
            <Carousel.Item>
                <img
                    className="d-block w-100"
                    src={ship_1}
                    alt="First slide"
                />
                <Carousel.Caption>
                    <h3>magna fermentum iaculis eu</h3>
                    <p>Nulla vitae elit libero, a pharetra augue mollis interdum.</p>
                </Carousel.Caption>
            </Carousel.Item>

            <Carousel.Item>
                <img
                    className="d-block w-100"
                    src={ship_2}
                    alt="Second slide"
                />
                <Carousel.Caption>
                    <h3>velit aliquet sagittis id</h3>
                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                </Carousel.Caption>
            </Carousel.Item>

            <Carousel.Item>
                <img
                    className="d-block w-100"
                    src={ship_3}
                    alt="Third slide"
                />
                <Carousel.Caption>
                    <h3>felis bibendum ut tristique</h3>
                    <p>Praesent commodo cursus magna, vel scelerisque nisl consectetur.</p>
                </Carousel.Caption>
            </Carousel.Item>

            <Carousel.Item>
                <img
                    className="d-block w-100"
                    src={ship_4}
                    alt="Fourth slide"
                />
                <Carousel.Caption>
                    <h3>aliquam nulla facilisi cras fermentum</h3>
                    <p>Praesent commodo cursus magna, vel scelerisque nisl consectetur.</p>
                </Carousel.Caption>
            </Carousel.Item>
        </Carousel>
    );
}
