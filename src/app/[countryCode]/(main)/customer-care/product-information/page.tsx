"use client"

import { useState } from "react"

export default function ProductInformationPage() {
  const [useInches, setUseInches] = useState(true)

  const convertToInches = (cm: number) => {
    return (cm / 2.54).toFixed(1)
  }

  const toggleUnit = () => {
    setUseInches(!useInches)
  }
  return (
    <div className="content-container py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Product Information</h1>
        
        <div className="prose prose-lg max-w-none">
          <h2 className="text-2xl font-bold mb-6 mt-8">Product Authenticity</h2>
          <p className="text-gray-600 leading-relaxed mb-6">
            The Revetir Marketplace is directly supplied by brands, department stores, and manufacturers verified by our team to sell authentic products. For added assurance, every order that Revetir ships undergoes a thorough examination and comparison against known authentic references to the best of our ability and based on available information and expertise. Certain items may also include the designer's own proof of authenticity, such as an authenticity card, RFID/NFC tag, dust bag or other packaging.
          </p>
          
          <h2 className="text-2xl font-bold mb-6 mt-8">Product Details</h2>
          <p className="text-gray-600 leading-relaxed mb-6">
            Revetir is committed to ensuring that the photos, descriptions, availability and other details of the goods published on Revetir's website are as accurate and up-to-date as possible.
          </p>
          
          <p className="text-gray-600 leading-relaxed mb-6">
            Unfortunately, sometimes inaccuracies and errors may occur that affect your order. Revetir will send a message to your e-mail address if the actual details are different from those stated in your order. In this case, you and Revetir will not be bound by your original order and, unless you and Revetir agree otherwise, your order will be cancelled, with any payment you made for your ordered goods refunded, and there will be no contract resulting from your order.
          </p>
          
                     <div className="flex justify-between items-center mb-6 mt-8">
             <h2 className="text-2xl font-bold">Sizing</h2>
                           <div className="flex">
                <button 
                  onClick={() => setUseInches(false)}
                  className={`px-4 py-2 text-sm border border-gray-300 transition-colors ${
                    !useInches 
                      ? 'bg-black text-white' 
                      : 'bg-white text-black hover:bg-gray-50'
                  }`}
                >
                  Metric
                </button>
                <button 
                  onClick={() => setUseInches(true)}
                  className={`px-4 py-2 text-sm border border-gray-300 border-l-0 transition-colors ${
                    useInches 
                      ? 'bg-black text-white' 
                      : 'bg-white text-black hover:bg-gray-50'
                  }`}
                >
                  Imperial
                </button>
              </div>
           </div>

           <p className="text-gray-600 leading-relaxed mb-6">
             Provided below are general sizing guidelines and conversions for menswear, womenswear, and footwear. 
           </p>

           <h3 className="text-xl font-bold mb-4 mt-6">Menswear Sizing:</h3>
           <div className="overflow-x-auto mb-6">
             <table className="min-w-full border-t border-b border-gray-300">
               <tbody>
                 <tr>
                   <td className="border-b border-gray-300 px-4 py-2 font-medium">Label size</td>
                   <td className="border-b border-gray-300 px-4 py-2">XXS</td>
                   <td className="border-b border-gray-300 px-4 py-2">XS</td>
                   <td className="border-b border-gray-300 px-4 py-2">S</td>
                   <td className="border-b border-gray-300 px-4 py-2">M</td>
                   <td className="border-b border-gray-300 px-4 py-2">L</td>
                   <td className="border-b border-gray-300 px-4 py-2">XL</td>
                   <td className="border-b border-gray-300 px-4 py-2">XXL</td>
                 </tr>
                 <tr>
                   <td className="border-b border-gray-300 px-4 py-2 font-medium">US size</td>
                   <td className="border-b border-gray-300 px-4 py-2">32</td>
                   <td className="border-b border-gray-300 px-4 py-2">34</td>
                   <td className="border-b border-gray-300 px-4 py-2">36</td>
                   <td className="border-b border-gray-300 px-4 py-2">38</td>
                   <td className="border-b border-gray-300 px-4 py-2">40</td>
                   <td className="border-b border-gray-300 px-4 py-2">42</td>
                   <td className="border-b border-gray-300 px-4 py-2">44</td>
                 </tr>
                 <tr>
                   <td className="border-b border-gray-300 px-4 py-2 font-medium">FR size</td>
                   <td className="border-b border-gray-300 px-4 py-2">42</td>
                   <td className="border-b border-gray-300 px-4 py-2">44</td>
                   <td className="border-b border-gray-300 px-4 py-2">46</td>
                   <td className="border-b border-gray-300 px-4 py-2">48</td>
                   <td className="border-b border-gray-300 px-4 py-2">50</td>
                   <td className="border-b border-gray-300 px-4 py-2">52</td>
                   <td className="border-b border-gray-300 px-4 py-2">54</td>
                 </tr>
                 <tr>
                   <td className="border-b border-gray-300 px-4 py-2 font-medium">UK size</td>
                   <td className="border-b border-gray-300 px-4 py-2">32</td>
                   <td className="border-b border-gray-300 px-4 py-2">34</td>
                   <td className="border-b border-gray-300 px-4 py-2">36</td>
                   <td className="border-b border-gray-300 px-4 py-2">38</td>
                   <td className="border-b border-gray-300 px-4 py-2">40</td>
                   <td className="border-b border-gray-300 px-4 py-2">42</td>
                   <td className="border-b border-gray-300 px-4 py-2">44</td>
                 </tr>
                 <tr>
                   <td className="border-b border-gray-300 px-4 py-2 font-medium">IT size</td>
                   <td className="border-b border-gray-300 px-4 py-2">46</td>
                   <td className="border-b border-gray-300 px-4 py-2">48</td>
                   <td className="border-b border-gray-300 px-4 py-2">50</td>
                   <td className="border-b border-gray-300 px-4 py-2">52</td>
                   <td className="border-b border-gray-300 px-4 py-2">54</td>
                   <td className="border-b border-gray-300 px-4 py-2">56</td>
                   <td className="border-b border-gray-300 px-4 py-2">58</td>
                 </tr>
                 <tr>
                   <td className="border-b border-gray-300 px-4 py-2 font-medium">Chest</td>
                                       <td className="border-b border-gray-300 px-4 py-2">{useInches ? `${convertToInches(90)}"` : '90 cm'}</td>
                    <td className="border-b border-gray-300 px-4 py-2">{useInches ? `${convertToInches(95)}"` : '95 cm'}</td>
                    <td className="border-b border-gray-300 px-4 py-2">{useInches ? `${convertToInches(100)}"` : '100 cm'}</td>
                    <td className="border-b border-gray-300 px-4 py-2">{useInches ? `${convertToInches(105)}"` : '105 cm'}</td>
                    <td className="border-b border-gray-300 px-4 py-2">{useInches ? `${convertToInches(108)}"` : '108 cm'}</td>
                    <td className="border-b border-gray-300 px-4 py-2">{useInches ? `${convertToInches(112)}"` : '112 cm'}</td>
                    <td className="border-b border-gray-300 px-4 py-2">{useInches ? `${convertToInches(116)}"` : '116 cm'}</td>
                 </tr>
                 <tr>
                   <td className="border-b border-gray-300 px-4 py-2 font-medium">Waist</td>
                                       <td className="border-b border-gray-300 px-4 py-2">{useInches ? `${convertToInches(74)}"` : '74 cm'}</td>
                    <td className="border-b border-gray-300 px-4 py-2">{useInches ? `${convertToInches(78)}"` : '78 cm'}</td>
                    <td className="border-b border-gray-300 px-4 py-2">{useInches ? `${convertToInches(82)}"` : '82 cm'}</td>
                    <td className="border-b border-gray-300 px-4 py-2">{useInches ? `${convertToInches(84)}"` : '84 cm'}</td>
                    <td className="border-b border-gray-300 px-4 py-2">{useInches ? `${convertToInches(88)}"` : '88 cm'}</td>
                    <td className="border-b border-gray-300 px-4 py-2">{useInches ? `${convertToInches(92)}"` : '92 cm'}</td>
                    <td className="border-b border-gray-300 px-4 py-2">{useInches ? `${convertToInches(96)}"` : '96 cm'}</td>
                 </tr>
                 <tr>
                   <td className="border-b border-gray-300 px-4 py-2 font-medium">Shoulder Width</td>
                                       <td className="border-b border-gray-300 px-4 py-2">{useInches ? `${convertToInches(45)}"` : '45 cm'}</td>
                    <td className="border-b border-gray-300 px-4 py-2">{useInches ? `${convertToInches(46)}"` : '46 cm'}</td>
                    <td className="border-b border-gray-300 px-4 py-2">{useInches ? `${convertToInches(47)}"` : '47 cm'}</td>
                    <td className="border-b border-gray-300 px-4 py-2">{useInches ? `${convertToInches(48)}"` : '48 cm'}</td>
                    <td className="border-b border-gray-300 px-4 py-2">{useInches ? `${convertToInches(49)}"` : '49 cm'}</td>
                    <td className="border-b border-gray-300 px-4 py-2">{useInches ? `${convertToInches(50)}"` : '50 cm'}</td>
                    <td className="border-b border-gray-300 px-4 py-2">{useInches ? `${convertToInches(51)}"` : '51 cm'}</td>
                 </tr>
               </tbody>
             </table>
           </div>

           <h3 className="text-xl font-bold mb-4 mt-6">Womenswear Sizing:</h3>
           <div className="overflow-x-auto mb-6">
             <table className="min-w-full border-t border-b border-gray-300">
               <tbody>
                 <tr>
                   <td className="border-b border-gray-300 px-4 py-2 font-medium">Label size</td>
                   <td className="border-b border-gray-300 px-4 py-2">XXS</td>
                   <td className="border-b border-gray-300 px-4 py-2">XS</td>
                   <td className="border-b border-gray-300 px-4 py-2">S</td>
                   <td className="border-b border-gray-300 px-4 py-2">M</td>
                   <td className="border-b border-gray-300 px-4 py-2">L</td>
                   <td className="border-b border-gray-300 px-4 py-2">XL</td>
                   <td className="border-b border-gray-300 px-4 py-2">XXL</td>
                 </tr>
                 <tr>
                   <td className="border-b border-gray-300 px-4 py-2 font-medium">US size</td>
                   <td className="border-b border-gray-300 px-4 py-2">0</td>
                   <td className="border-b border-gray-300 px-4 py-2">2</td>
                   <td className="border-b border-gray-300 px-4 py-2">4</td>
                   <td className="border-b border-gray-300 px-4 py-2">6</td>
                   <td className="border-b border-gray-300 px-4 py-2">8</td>
                   <td className="border-b border-gray-300 px-4 py-2">10</td>
                   <td className="border-b border-gray-300 px-4 py-2">12</td>
                 </tr>
                 <tr>
                   <td className="border-b border-gray-300 px-4 py-2 font-medium">FR size</td>
                   <td className="border-b border-gray-300 px-4 py-2">32</td>
                   <td className="border-b border-gray-300 px-4 py-2">34</td>
                   <td className="border-b border-gray-300 px-4 py-2">36</td>
                   <td className="border-b border-gray-300 px-4 py-2">38</td>
                   <td className="border-b border-gray-300 px-4 py-2">40</td>
                   <td className="border-b border-gray-300 px-4 py-2">42</td>
                   <td className="border-b border-gray-300 px-4 py-2">44</td>
                 </tr>
                 <tr>
                   <td className="border-b border-gray-300 px-4 py-2 font-medium">UK Size</td>
                   <td className="border-b border-gray-300 px-4 py-2">4</td>
                   <td className="border-b border-gray-300 px-4 py-2">6</td>
                   <td className="border-b border-gray-300 px-4 py-2">8</td>
                   <td className="border-b border-gray-300 px-4 py-2">10</td>
                   <td className="border-b border-gray-300 px-4 py-2">12</td>
                   <td className="border-b border-gray-300 px-4 py-2">14</td>
                   <td className="border-b border-gray-300 px-4 py-2">16</td>
                 </tr>
                 <tr>
                   <td className="border-b border-gray-300 px-4 py-2 font-medium">IT size</td>
                   <td className="border-b border-gray-300 px-4 py-2">36</td>
                   <td className="border-b border-gray-300 px-4 py-2">38</td>
                   <td className="border-b border-gray-300 px-4 py-2">40</td>
                   <td className="border-b border-gray-300 px-4 py-2">42</td>
                   <td className="border-b border-gray-300 px-4 py-2">44</td>
                   <td className="border-b border-gray-300 px-4 py-2">46</td>
                   <td className="border-b border-gray-300 px-4 py-2">48</td>
                 </tr>
                 <tr>
                   <td className="border-b border-gray-300 px-4 py-2 font-medium">Bust</td>
                                       <td className="border-b border-gray-300 px-4 py-2">{useInches ? `${convertToInches(78)}"` : '78 cm'}</td>
                    <td className="border-b border-gray-300 px-4 py-2">{useInches ? `${convertToInches(80)}"` : '80 cm'}</td>
                    <td className="border-b border-gray-300 px-4 py-2">{useInches ? `${convertToInches(84)}"` : '84 cm'}</td>
                    <td className="border-b border-gray-300 px-4 py-2">{useInches ? `${convertToInches(88)}"` : '88 cm'}</td>
                    <td className="border-b border-gray-300 px-4 py-2">{useInches ? `${convertToInches(92)}"` : '92 cm'}</td>
                    <td className="border-b border-gray-300 px-4 py-2">{useInches ? `${convertToInches(96)}"` : '96 cm'}</td>
                    <td className="border-b border-gray-300 px-4 py-2">{useInches ? `${convertToInches(100)}"` : '100 cm'}</td>
                 </tr>
                 <tr>
                   <td className="border-b border-gray-300 px-4 py-2 font-medium">Waist</td>
                                       <td className="border-b border-gray-300 px-4 py-2">{useInches ? `${convertToInches(58)}"` : '58 cm'}</td>
                    <td className="border-b border-gray-300 px-4 py-2">{useInches ? `${convertToInches(62)}"` : '62 cm'}</td>
                    <td className="border-b border-gray-300 px-4 py-2">{useInches ? `${convertToInches(65)}"` : '65 cm'}</td>
                    <td className="border-b border-gray-300 px-4 py-2">{useInches ? `${convertToInches(72)}"` : '72 cm'}</td>
                    <td className="border-b border-gray-300 px-4 py-2">{useInches ? `${convertToInches(76)}"` : '76 cm'}</td>
                    <td className="border-b border-gray-300 px-4 py-2">{useInches ? `${convertToInches(78)}"` : '78 cm'}</td>
                    <td className="border-b border-gray-300 px-4 py-2">{useInches ? `${convertToInches(82)}"` : '82 cm'}</td>
                 </tr>
                 <tr>
                   <td className="border-b border-gray-300 px-4 py-2 font-medium">Hips</td>
                                       <td className="border-b border-gray-300 px-4 py-2">{useInches ? `${convertToInches(86)}"` : '86 cm'}</td>
                    <td className="border-b border-gray-300 px-4 py-2">{useInches ? `${convertToInches(90)}"` : '90 cm'}</td>
                    <td className="border-b border-gray-300 px-4 py-2">{useInches ? `${convertToInches(94)}"` : '94 cm'}</td>
                    <td className="border-b border-gray-300 px-4 py-2">{useInches ? `${convertToInches(98)}"` : '98 cm'}</td>
                    <td className="border-b border-gray-300 px-4 py-2">{useInches ? `${convertToInches(102)}"` : '102 cm'}</td>
                    <td className="border-b border-gray-300 px-4 py-2">{useInches ? `${convertToInches(106)}"` : '106 cm'}</td>
                    <td className="border-b border-gray-300 px-4 py-2">{useInches ? `${convertToInches(110)}"` : '110 cm'}</td>
                 </tr>
               </tbody>
             </table>
           </div>

           <h3 className="text-xl font-bold mb-4 mt-6">Men's Shoes:</h3>
           <div className="overflow-x-auto mb-6">
             <table className="min-w-full border-t border-b border-gray-300">
               <tbody>
                 <tr>
                   <td className="border-b border-gray-300 px-4 py-2 font-medium">Size</td>
                   <td className="border-b border-gray-300 px-4 py-2">39</td>
                   <td className="border-b border-gray-300 px-4 py-2">40</td>
                   <td className="border-b border-gray-300 px-4 py-2">41</td>
                   <td className="border-b border-gray-300 px-4 py-2">42</td>
                   <td className="border-b border-gray-300 px-4 py-2">43</td>
                   <td className="border-b border-gray-300 px-4 py-2">44</td>
                   <td className="border-b border-gray-300 px-4 py-2">45</td>
                   <td className="border-b border-gray-300 px-4 py-2">46</td>
                   <td className="border-b border-gray-300 px-4 py-2">47</td>
                   <td className="border-b border-gray-300 px-4 py-2">48</td>
                 </tr>
                 <tr>
                   <td className="border-b border-gray-300 px-4 py-2 font-medium">US</td>
                   <td className="border-b border-gray-300 px-4 py-2">6</td>
                   <td className="border-b border-gray-300 px-4 py-2">7</td>
                   <td className="border-b border-gray-300 px-4 py-2">8</td>
                   <td className="border-b border-gray-300 px-4 py-2">9</td>
                   <td className="border-b border-gray-300 px-4 py-2">10</td>
                   <td className="border-b border-gray-300 px-4 py-2">11</td>
                   <td className="border-b border-gray-300 px-4 py-2">12</td>
                   <td className="border-b border-gray-300 px-4 py-2">13</td>
                   <td className="border-b border-gray-300 px-4 py-2">14</td>
                   <td className="border-b border-gray-300 px-4 py-2">15</td>
                 </tr>
                 <tr>
                   <td className="border-b border-gray-300 px-4 py-2 font-medium">EUR</td>
                   <td className="border-b border-gray-300 px-4 py-2">39</td>
                   <td className="border-b border-gray-300 px-4 py-2">40</td>
                   <td className="border-b border-gray-300 px-4 py-2">41</td>
                   <td className="border-b border-gray-300 px-4 py-2">42</td>
                   <td className="border-b border-gray-300 px-4 py-2">43</td>
                   <td className="border-b border-gray-300 px-4 py-2">44</td>
                   <td className="border-b border-gray-300 px-4 py-2">45</td>
                   <td className="border-b border-gray-300 px-4 py-2">46</td>
                   <td className="border-b border-gray-300 px-4 py-2">47</td>
                   <td className="border-b border-gray-300 px-4 py-2">48</td>
                 </tr>
                 <tr>
                   <td className="border-b border-gray-300 px-4 py-2 font-medium">UK</td>
                   <td className="border-b border-gray-300 px-4 py-2">5</td>
                   <td className="border-b border-gray-300 px-4 py-2">6</td>
                   <td className="border-b border-gray-300 px-4 py-2">7</td>
                   <td className="border-b border-gray-300 px-4 py-2">8</td>
                   <td className="border-b border-gray-300 px-4 py-2">9</td>
                   <td className="border-b border-gray-300 px-4 py-2">10</td>
                   <td className="border-b border-gray-300 px-4 py-2">11</td>
                   <td className="border-b border-gray-300 px-4 py-2">12</td>
                   <td className="border-b border-gray-300 px-4 py-2">13</td>
                   <td className="border-b border-gray-300 px-4 py-2">14</td>
                 </tr>
                 <tr>
                   <td className="border-b border-gray-300 px-4 py-2 font-medium">JP</td>
                   <td className="border-b border-gray-300 px-4 py-2">26</td>
                   <td className="border-b border-gray-300 px-4 py-2">26.5</td>
                   <td className="border-b border-gray-300 px-4 py-2">27</td>
                   <td className="border-b border-gray-300 px-4 py-2">27.5</td>
                   <td className="border-b border-gray-300 px-4 py-2">28.5</td>
                   <td className="border-b border-gray-300 px-4 py-2">29</td>
                   <td className="border-b border-gray-300 px-4 py-2">29.5</td>
                   <td className="border-b border-gray-300 px-4 py-2">30.5</td>
                   <td className="border-b border-gray-300 px-4 py-2">31</td>
                   <td className="border-b border-gray-300 px-4 py-2">32</td>
                 </tr>
                 <tr>
                   <td className="border-b border-gray-300 px-4 py-2 font-medium">KR</td>
                   <td className="border-b border-gray-300 px-4 py-2">245</td>
                   <td className="border-b border-gray-300 px-4 py-2">250</td>
                   <td className="border-b border-gray-300 px-4 py-2">260</td>
                   <td className="border-b border-gray-300 px-4 py-2">265</td>
                   <td className="border-b border-gray-300 px-4 py-2">275</td>
                   <td className="border-b border-gray-300 px-4 py-2">280</td>
                   <td className="border-b border-gray-300 px-4 py-2">290</td>
                   <td className="border-b border-gray-300 px-4 py-2">300</td>
                   <td className="border-b border-gray-300 px-4 py-2">305</td>
                   <td className="border-b border-gray-300 px-4 py-2">315</td>
                 </tr>
               </tbody>
             </table>
           </div>

           <h3 className="text-xl font-bold mb-4 mt-6">Women's Shoes:</h3>
           <div className="overflow-x-auto mb-6">
             <table className="min-w-full border-t border-b border-gray-300">
               <tbody>
                 <tr>
                   <td className="border-b border-gray-300 px-4 py-2 font-medium">Size</td>
                   <td className="border-b border-gray-300 px-4 py-2">34</td>
                   <td className="border-b border-gray-300 px-4 py-2">35</td>
                   <td className="border-b border-gray-300 px-4 py-2">36</td>
                   <td className="border-b border-gray-300 px-4 py-2">37</td>
                   <td className="border-b border-gray-300 px-4 py-2">38</td>
                   <td className="border-b border-gray-300 px-4 py-2">39</td>
                   <td className="border-b border-gray-300 px-4 py-2">40</td>
                   <td className="border-b border-gray-300 px-4 py-2">41</td>
                   <td className="border-b border-gray-300 px-4 py-2">42</td>
                 </tr>
                 <tr>
                   <td className="border-b border-gray-300 px-4 py-2 font-medium">US</td>
                   <td className="border-b border-gray-300 px-4 py-2">4</td>
                   <td className="border-b border-gray-300 px-4 py-2">5</td>
                   <td className="border-b border-gray-300 px-4 py-2">6</td>
                   <td className="border-b border-gray-300 px-4 py-2">7</td>
                   <td className="border-b border-gray-300 px-4 py-2">8</td>
                   <td className="border-b border-gray-300 px-4 py-2">9</td>
                   <td className="border-b border-gray-300 px-4 py-2">10</td>
                   <td className="border-b border-gray-300 px-4 py-2">11</td>
                   <td className="border-b border-gray-300 px-4 py-2">12</td>
                 </tr>
                 <tr>
                   <td className="border-b border-gray-300 px-4 py-2 font-medium">EUR</td>
                   <td className="border-b border-gray-300 px-4 py-2">34</td>
                   <td className="border-b border-gray-300 px-4 py-2">35</td>
                   <td className="border-b border-gray-300 px-4 py-2">36</td>
                   <td className="border-b border-gray-300 px-4 py-2">37</td>
                   <td className="border-b border-gray-300 px-4 py-2">38</td>
                   <td className="border-b border-gray-300 px-4 py-2">39</td>
                   <td className="border-b border-gray-300 px-4 py-2">40</td>
                   <td className="border-b border-gray-300 px-4 py-2">41</td>
                   <td className="border-b border-gray-300 px-4 py-2">42</td>
                 </tr>
                 <tr>
                   <td className="border-b border-gray-300 px-4 py-2 font-medium">UK</td>
                   <td className="border-b border-gray-300 px-4 py-2">1</td>
                   <td className="border-b border-gray-300 px-4 py-2">2</td>
                   <td className="border-b border-gray-300 px-4 py-2">3</td>
                   <td className="border-b border-gray-300 px-4 py-2">4</td>
                   <td className="border-b border-gray-300 px-4 py-2">5</td>
                   <td className="border-b border-gray-300 px-4 py-2">6</td>
                   <td className="border-b border-gray-300 px-4 py-2">7</td>
                   <td className="border-b border-gray-300 px-4 py-2">8</td>
                   <td className="border-b border-gray-300 px-4 py-2">9</td>
                 </tr>
                 <tr>
                   <td className="border-b border-gray-300 px-4 py-2 font-medium">JP</td>
                   <td className="border-b border-gray-300 px-4 py-2">22.5</td>
                   <td className="border-b border-gray-300 px-4 py-2">23</td>
                   <td className="border-b border-gray-300 px-4 py-2">24</td>
                   <td className="border-b border-gray-300 px-4 py-2">24.5</td>
                   <td className="border-b border-gray-300 px-4 py-2">25</td>
                   <td className="border-b border-gray-300 px-4 py-2">26</td>
                   <td className="border-b border-gray-300 px-4 py-2">26.5</td>
                   <td className="border-b border-gray-300 px-4 py-2">27</td>
                   <td className="border-b border-gray-300 px-4 py-2">28</td>
                 </tr>
                 <tr>
                   <td className="border-b border-gray-300 px-4 py-2 font-medium">KR</td>
                   <td className="border-b border-gray-300 px-4 py-2">210</td>
                   <td className="border-b border-gray-300 px-4 py-2">220</td>
                   <td className="border-b border-gray-300 px-4 py-2">230</td>
                   <td className="border-b border-gray-300 px-4 py-2">240</td>
                   <td className="border-b border-gray-300 px-4 py-2">250</td>
                   <td className="border-b border-gray-300 px-4 py-2">260</td>
                   <td className="border-b border-gray-300 px-4 py-2">270</td>
                   <td className="border-b border-gray-300 px-4 py-2">280</td>
                   <td className="border-b border-gray-300 px-4 py-2">290</td>
                 </tr>
               </tbody>
             </table>
           </div>

           <p className="text-gray-600 leading-relaxed mb-6">
             Please note that fit is subective and these are general suggestions. Given our wide range of international brands and designers, sizing variations are bound to occur. In order to help you find your perfect size, our customer care team is always available to answer any questions you may have regarding measurements and fitting.
           </p>
          
          <h2 className="text-2xl font-bold mb-6 mt-8">Garment Care</h2>
          <p className="text-gray-600 leading-relaxed mb-6">
            Indicated below are general care instructions according to fabric. For safe results, always test laundering on a small or hidden area of the garment first.
          </p>
          
          <p className="text-gray-600 leading-relaxed mb-6">
            Please note that these are general recommendations. For more accurate guidelines, please follow the specific care instructions indicated on the garment label or packaging.
          </p>
          
          <h3 className="text-xl font-bold mb-4 mt-6">Natural Fabrics:</h3>
          <p className="text-gray-600 leading-relaxed mb-4">
            Cotton, silk, leather and wool are examples of natural fabrics produced from materials derived from plants and/or animals. Materials made from natural sources require special care and attention to preserve their quality.
          </p>
          
          <div className="overflow-x-auto mb-6">
            <table className="min-w-full border-t border-b border-gray-300">
              <tbody>
                <tr>
                  <td className="border-b border-gray-300 px-4 py-2 font-medium">Cotton</td>
                  <td className="border-b border-gray-300 px-4 py-2">
                    <ul className="list-disc pl-4">
                      <li>Machine wash in cold water, normal wash cycle</li>
                      <li>Tumble dry on low setting</li>
                    </ul>
                  </td>
                </tr>
                <tr>
                  <td className="border-b border-gray-300 px-4 py-2 font-medium">Denim</td>
                  <td className="border-b border-gray-300 px-4 py-2">
                    <ul className="list-disc pl-4">
                      <li>Machine wash inside-out in warm water, gentle wash cycle</li>
                      <li>Lay flat to dry highly recommended</li>
                    </ul>
                  </td>
                </tr>
                <tr>
                  <td className="border-b border-gray-300 px-4 py-2 font-medium">Linen</td>
                  <td className="border-b border-gray-300 px-4 py-2">
                    <ul className="list-disc pl-4">
                      <li>Machine wash in warm water, gentle wash cycle</li>
                      <li>Tumble dry on cool, remove when still slightly damp</li>
                    </ul>
                  </td>
                </tr>
                <tr>
                  <td className="border-b border-gray-300 px-4 py-2 font-medium">Cashmere</td>
                  <td className="border-b border-gray-300 px-4 py-2">
                    <ul className="list-disc pl-4">
                      <li>Hand wash in lukewarm water. Do not wring, squeeze, or twist</li>
                      <li>Lay flat to dry, away from direct heat or sunlight</li>
                    </ul>
                  </td>
                </tr>
                <tr>
                  <td className="border-b border-gray-300 px-4 py-2 font-medium">Mohair</td>
                  <td className="border-b border-gray-300 px-4 py-2">
                    <ul className="list-disc pl-4">
                      <li>Dry clean is highly recommended</li>
                      <li>Otherwise, hand wash in lukewarm water</li>
                      <li>Lay flat to dry</li>
                    </ul>
                  </td>
                </tr>
                <tr>
                  <td className="border-b border-gray-300 px-4 py-2 font-medium">Wool</td>
                  <td className="border-b border-gray-300 px-4 py-2">
                    <ul className="list-disc pl-4">
                      <li>Hand wash in lukewarm water. Do not wring, squeeze, or twist</li>
                      <li>Lay flat to dry, away from direct heat or sunlight</li>
                    </ul>
                  </td>
                </tr>
                <tr>
                  <td className="border-b border-gray-300 px-4 py-2 font-medium">Silk</td>
                  <td className="border-b border-gray-300 px-4 py-2">
                    <ul className="list-disc pl-4">
                      <li>Dry clean is highly recommended</li>
                      <li>Hand wash in lukewarm water. Do not wring, squeeze, or twist</li>
                      <li>Lay flat to dry</li>
                      <li>Iron inside-out on low setting</li>
                    </ul>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <p className="text-gray-600 leading-relaxed mb-6">
            Please note that pilling is a natural process that occasionally may occur in woolen fibres. Washing your clothes inside out will help prevent pilling and investing in an electric de-piller will help safely remove them. However, if left alone, these will eventually pull away on their own.
          </p>
          
          <h3 className="text-xl font-bold mb-4 mt-6">Synthetic Fabrics:</h3>
          <p className="text-gray-600 leading-relaxed mb-4">
            Synthetic fabrics are textiles made from man-made materials rather than natural ones.
          </p>
          
          <div className="overflow-x-auto mb-6">
            <table className="min-w-full border-t border-b border-gray-300">
              <tbody>
                <tr>
                  <td className="border-b border-gray-300 px-4 py-2 font-medium">Elastane</td>
                  <td className="border-b border-gray-300 px-4 py-2">
                    <ul className="list-disc pl-4">
                      <li>Machine wash in mesh washing bag in cold water, gentle wash cycle</li>
                      <li>Lay flat to dry, or tumble dry on low setting</li>
                      <li>Iron on low setting</li>
                      <li>Dry clean is not recommended</li>
                    </ul>
                  </td>
                </tr>
                <tr>
                  <td className="border-b border-gray-300 px-4 py-2 font-medium">Modal</td>
                  <td className="border-b border-gray-300 px-4 py-2">
                    <ul className="list-disc pl-4">
                      <li>Machine wash in cold water, normal wash cycle</li>
                      <li>Tumble dry on low setting, remove when slightly damp to reduce wrinkling</li>
                    </ul>
                  </td>
                </tr>
                <tr>
                  <td className="border-b border-gray-300 px-4 py-2 font-medium">Nylon</td>
                  <td className="border-b border-gray-300 px-4 py-2">
                    <ul className="list-disc pl-4">
                      <li>Machine wash in cold water, according to cycle on garment label</li>
                      <li>Tumble dry on low setting, adding a dryer sheet will greatly reduce static</li>
                      <li>Iron when necessary on cool setting</li>
                    </ul>
                  </td>
                </tr>
                <tr>
                  <td className="border-b border-gray-300 px-4 py-2 font-medium">Neoprene</td>
                  <td className="border-b border-gray-300 px-4 py-2">
                    <ul className="list-disc pl-4">
                      <li>Hand wash in lukewarm water</li>
                      <li>Lay flat to dry, do not tumble dry</li>
                      <li>Do not dry clean or expose to heat for extended periods of time</li>
                    </ul>
                  </td>
                </tr>
                <tr>
                  <td className="border-b border-gray-300 px-4 py-2 font-medium">Polyester</td>
                  <td className="border-b border-gray-300 px-4 py-2">
                    <ul className="list-disc pl-4">
                      <li>Machine wash inside out in warm water, permanent press cycle</li>
                      <li>Tumble dry on low setting</li>
                    </ul>
                  </td>
                </tr>
                <tr>
                  <td className="border-b border-gray-300 px-4 py-2 font-medium">Polyamide</td>
                  <td className="border-b border-gray-300 px-4 py-2">
                    <ul className="list-disc pl-4">
                      <li>Machine wash in cold water, normal wash cycle</li>
                      <li>Lay flat to dry</li>
                      <li>Iron inside-out on low setting</li>
                    </ul>
                  </td>
                </tr>
                <tr>
                  <td className="border-b border-gray-300 px-4 py-2 font-medium">Rayon</td>
                  <td className="border-b border-gray-300 px-4 py-2">
                    <ul className="list-disc pl-4">
                      <li>Hand wash in cold water. Do not wring, squeeze, or twist</li>
                      <li>Lay flat to dry</li>
                      <li>Iron inside-out while still damp on low setting</li>
                    </ul>
                  </td>
                </tr>
                <tr>
                  <td className="border-b border-gray-300 px-4 py-2 font-medium">Satin</td>
                  <td className="border-b border-gray-300 px-4 py-2">
                    <ul className="list-disc pl-4">
                      <li>Hand wash in cold water, or machine wash on gentle wash cycle. Do not wring, squeeze, or twist</li>
                      <li>Lay flat to dry</li>
                      <li>Iron inside-out on low setting with no steam</li>
                    </ul>
                  </td>
                </tr>
                <tr>
                  <td className="border-b border-gray-300 px-4 py-2 font-medium">Viscose</td>
                  <td className="border-b border-gray-300 px-4 py-2">
                    <ul className="list-disc pl-4">
                      <li>Hand wash in cold water, or machine wash on gentle wash cycle. Do not wring, squeeze, or twist</li>
                      <li>Lay flat to dry</li>
                      <li>Iron inside-out while still damp on low setting</li>
                    </ul>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <h3 className="text-xl font-bold mb-4 mt-6">Leather Goods:</h3>
          <p className="text-gray-600 leading-relaxed mb-4">
            It is normal for leather goods, such as handbags, shoes, wallets etc. to bear natural imperfections and irregularities. These natural imperfections make every piece original and exclusive to you.
          </p>
          
          <div className="overflow-x-auto mb-6">
            <table className="min-w-full border-t border-b border-gray-300">
              <tbody>
                <tr>
                  <td className="border-b border-gray-300 px-4 py-2 font-medium">Natural-grained Leather</td>
                  <td className="border-b border-gray-300 px-4 py-2">
                    <p className="mb-2">Natural-grained leather is premium-grade hide that has not been buffed to showcase the skin's natural "grain" or texture.</p>
                    <ul className="list-disc pl-4">
                      <li>Using a clean damp cloth, wipe gently to remove any dirt</li>
                    </ul>
                  </td>
                </tr>
                <tr>
                  <td className="border-b border-gray-300 px-4 py-2 font-medium">Embossed Leather</td>
                  <td className="border-b border-gray-300 px-4 py-2">
                    <p className="mb-2">Embossed leather is leather that has been stamped to achieve a distinctive pattern.</p>
                    <ul className="list-disc pl-4">
                      <li>Using a clean damp cloth, wipe gently to remove any dirt</li>
                    </ul>
                  </td>
                </tr>
                <tr>
                  <td className="border-b border-gray-300 px-4 py-2 font-medium">Buffed Leather</td>
                  <td className="border-b border-gray-300 px-4 py-2">
                    <p className="mb-2">Buffed leather is leather from which the top layer of grain has been removed to achieve a soft and clean surface.</p>
                    <ul className="list-disc pl-4">
                      <li>Using a clean damp cloth, wipe gently to remove any dirt</li>
                    </ul>
                  </td>
                </tr>
                <tr>
                  <td className="border-b border-gray-300 px-4 py-2 font-medium">Patent Leather</td>
                  <td className="border-b border-gray-300 px-4 py-2">
                    <p className="mb-2">Patent leather is a coated leather with a glossy varnished surface.</p>
                    <ul className="list-disc pl-4">
                      <li>Clean any dust or dirt with a damp cloth</li>
                      <li>Remove any scuff marks with a patent leather cleaner</li>
                      <li>Buff the leather to a high shine</li>
                    </ul>
                  </td>
                </tr>
                <tr>
                  <td className="border-b border-gray-300 px-4 py-2 font-medium">Suede Leather</td>
                  <td className="border-b border-gray-300 px-4 py-2">
                    <p className="mb-2">Suede is a leather that has a soft napped surface.</p>
                    <ul className="list-disc pl-4">
                      <li>Before use, seal the suede with a professional suede sealant to help repel dirt.</li>
                      <li>To treat a liquid spill, pat the area with a clean cloth and then apply a layer of cornmeal or talcum powder on the stain. Let it set overnight, then brush with a suede brush to remove the dried powder.</li>
                      <li>For dried stains, rub with a kneaded eraser or emery board. For heavier stains, blot with white vinegar and a clean towel. Repeat as needed until stain disappears. This can be used on both water and salt stains.</li>
                      <li className="mt-2 list-none"><em>Do not clean suede with water alone as it will affect both the color and texture of the leather.</em></li>
                    </ul>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
} 