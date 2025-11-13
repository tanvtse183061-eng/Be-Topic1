import './dealerstaff.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserTie, faCar, faChartBar, faUsers, faFileAlt } from '@fortawesome/free-solid-svg-icons';
import 'bootstrap/dist/css/bootstrap.min.css';
import { InputGroup, FormControl } from "react-bootstrap";
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { faBell } from "@fortawesome/free-solid-svg-icons";
import { faCarSide } from "@fortawesome/free-solid-svg-icons"; 
export default function Dealerstaff() {
    return (
        <> <div className="board-dealerstaff">
            <div className="sidebar-card">
                <div className="brand">
                    <h3>EVM Car</h3>
                </div>

                <div className="profile">
                    <FontAwesomeIcon icon={faUserTie} className="icon" />
                    <h2 className="staff-name">Thành Tấn</h2>
                    <p className="role">Dealer Staff</p>
                </div>

                <div className="menu">
                    <p className="menu-title">Chức năng</p>
                    <ul>
                        <li className='truy'><FontAwesomeIcon icon={faCar} /> Truy vấn thông tin xe</li>
                        <li className='quan'><FontAwesomeIcon icon={faFileAlt} /> Quản lý bán hàng</li>
                        <li className='hang'><FontAwesomeIcon icon={faUsers} /> Quản lý khách hàng</li>
                        <li className='bao'><FontAwesomeIcon icon={faChartBar} /> Báo cáo</li>
                    </ul>
                </div>
              
     
                
            </div>
            
        </div>
              <div className='title'>
                <h2>Hello,Tấn</h2>
              </div>
              <div className='search'>
                <InputGroup className="search-bar">
                    <InputGroup.Text>
                        <FontAwesomeIcon icon={faSearch} color='green' />
                    </InputGroup.Text>
                    <FormControl placeholder="Search " />
                </InputGroup>
              </div>
              <div className='bell'>
                <FontAwesomeIcon icon={faBell}  color='green' size='2x' className='icon'/>
              </div>
              <div className='car'>
                <FontAwesomeIcon icon={faCarSide} color='green' size='2x' className='car-moving' />
                <div className='road'></div>
              </div>
            
        </>
       
    );
}
