 import { BrowserRouter, Routes, Route } from "react-router-dom";
import HerioGreen from "./HerioGreen";
import Limo from "./Limo";
import Macan from "./Macan";
import Macan4 from "./Macan4";
import Minio from "./Minio";
import Vinfast3 from "./Vinfast3";
import Vinfast7 from "./Vinfast7";
import Vinfastxanh from "./Vinfastxanh";

export default function Carfull(){
    return(
        <>
         <BrowserRouter>
          <Routes>
          
            <Route path="/" element={<Limo />} />
            <Route path="/" element={<Macan />} />
            <Route path="/" element={<Macan4 />} />
            <Route path="/" element={<Minio />} />
            <Route path="/" element={<Vinfast3 />} />
            <Route path="/" element={<Vinfast7 />} />
            <Route path="/" element={<Vinfastxanh />} />

          </Routes>
         </BrowserRouter>

        </>
    )
}