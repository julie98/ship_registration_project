import React, { Component } from 'react'
import './ServicesBroker.css'

export default class ServicesBroker extends Component {
    render() {
        return (
            <div className='servicesbroker'>
                <nav className='crumbs'>
                    <ol>
                        <li className='crumb'><a href="/">Home</a></li>
                        <li className='crumb'><a href="/services">Services</a></li>
                        <li className='crumb'>Broker</li>
                    </ol>
                </nav>

                <h1> Broker </h1>
                <h4> Why Using NaDoT's Services as a broker? </h4>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
                    labore et dolore magna aliqua. Rhoncus aenean vel elit scelerisque mauris.
                    Eu scelerisque felis imperdiet proin fermentum leo vel. Ultrices mi tempus imperdiet nulla.
                    Risus at ultrices mi tempus imperdiet nulla malesuada pellentesque elit.
                    Aenean et tortor at risus viverra adipiscing at. Mi proin sed libero enim sed.
                    Donec et odio pellentesque diam volutpat commodo sed egestas egestas.
                    At ultrices mi tempus imperdiet nulla malesuada pellentesque.
                    Dictumst quisque sagittis purus sit amet volutpat consequat mauris nunc.
                    Sed velit dignissim sodales ut eu sem. Cursus mattis molestie a iaculis at erat
                    pellentesque adipiscing commodo. Eget gravida cum sociis natoque penatibus et magnis.
                    Tempor commodo ullamcorper a lacus vestibulum sed arcu non odio. Morbi tincidunt augue
                    interdum velit euismod in pellentesque massa. Morbi blandit cursus risus at ultrices mi tempus.
                    Aenean euismod elementum nisi quis.</p>

                <p>Ultricies mi eget mauris pharetra et. Est lorem ipsum dolor sit amet consectetur adipiscing.
                    Imperdiet sed euismod nisi porta lorem mollis aliquam ut porttitor. Ullamcorper morbi tincidunt
                    ornare massa. Urna molestie at elementum eu facilisis sed odio morbi. Ut consequat semper viverra
                    nam. Sit amet cursus sit amet. At varius vel pharetra vel. Fames ac turpis egestas integer.
                    Ullamcorper morbi tincidunt ornare massa eget. Vivamus at augue eget arcu dictum.
                    Tortor pretium viverra suspendisse potenti nullam ac tortor vitae purus. Commodo quis imperdiet
                    massa tincidunt. Id donec ultrices tincidunt arcu non sodales neque. Lectus nulla at volutpat
                    diam ut venenatis. Dictum fusce ut placerat orci nulla.</p>

                <em>Additional Benefits: </em>
                <ol>
                    <li className='benefits'>Sed viverra tellus in hac habitasse platea dictumst vestibulum rhoncus</li>
                    <li className='benefits'>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
                        tempor incididunt ut labore et dolore magna aliqua</li>
                    <li className='benefits'>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
                        tempor incididunt ut labore et dolore magna aliqua</li>
                </ol>

            </div>
        );
    }
}
