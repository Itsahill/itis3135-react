import Header from './Header.jsx'
import Footer from './Footer.jsx'
import figure from './assets/me-in-alaska.jpg'
export default function Intro() {
    return (
        <body>
            <Header />
            <main>
                <h2>Introduction</h2>
        <figure>
            <img src={figure} alt="Sahil Luqman." />
            <figcaption>A photo of me in Alaska.</figcaption>
        </figure>
        <ul>
            <li><b>Personal Background:</b> I was born in India and my parents moved us to NJ when I was two years old. We moved to Illinois, and then to NC where we’ve stayed since.</li>
            <li><b>Academic Background:</b> I have not transferred from any other college, and this is my third year at UNC Charlotte.</li>
            <li><b>Primary Computer:</b> Dell Inspiron 7620, usually used in my apartment room because it has decided to randomly stop working if I move it around too much. Thanks, Dell!</li>
            <li><b>Current Courses: </b>
            <ul>
                <li><b>ITSC 3160-Database Design and Implementation:</b> Required, but I really feel like this will expand on stuff I want to learn for my concentration.</li>
                <li><b>ITIS 3200 - Introduction to Security and Privacy:</b> This is DEFINITELY relevant to my Cybersecurity concentration and I’m really excited for this course.</li>
                <li><b>ITIS 3246 - IT Infrastructure and Security:</b> Also relevant to my concentration, but also would be better for general career help.</li>
            </ul>
            </li>
            <li><b>Interesting Fact About Me: </b>By this September, I will be an American Citizen!</li>
        </ul>
            </main>
            <Footer />
        </body>

    )
}