import React, { useState, useEffect } from 'react';
import { FormButton, FormTitle, Input } from '../GlobalStyles/FormStyles';
import { SearchBoxContainer } from '../../components/GlobalStyles/PageStyles';
import styled from 'styled-components';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./box.css";
import { useNavigate } from 'react-router-dom';
import SelectOccupancy from './SelectOccupancy';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import SearchIcon from '@mui/icons-material/Search';
import MicIcon from '@mui/icons-material/Mic';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import useSpeechRecognition from './useSpeechRecognition';
import axios from 'axios';

const Extras = styled.div`
    margin-top: 20px;
    display: flex;
    align-items: center;
    gap: 12px;
`;

const InputContainer = styled.div`
    width: 100%;
    label {
        color: #000;
        font-size: 16px;
        font-weight: bold;
        display: block;
        margin-bottom: 8px;
    }
`;

const SearchBox = (props) => {
    const data = props.params;
    const styles = props.styles;

    const [checkIn, setCheckIn] = useState(data ? new Date(data.from) : new Date());
    const [checkOut, setCheckOut] = useState(data ? new Date(data.to) : new Date());
    const [query, setQuery] = useState(data ? data.location : '');
    const [count, setCount] = useState({
        children: data ? data.people.children : 0,
        adults: data ? data.people.adults : 0
    });
    const { transcript, listening, startListening, stopListening } = useSpeechRecognition();
    const navigate = useNavigate();

    useEffect(() => {
        if (transcript) {
            setQuery(transcript);
        }
    }, [transcript]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (count.children === 0 && count.adults === 0) {
            toast.warning("Please enter number of people.", {
                autoClose: 5500,
                pauseOnHover: true
            });
            return;
        }
        const from = checkIn.toISOString();
        const to = checkOut.toISOString();
        const searchData = {
            from,
            to,
            people: count,
            location: query
        };
        navigate(`/explore/${query}/${from}/${to}/${count.adults + count.children}`, { state: searchData });
    };

    const handleMicClick = () => {
        if (listening) {
            stopListening();
        } else {
            startListening();
        }
    };

    const fetchLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    axios.get(`https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=02e0698ed6c84c87ab63df191443a650`)
                        .then((response) => {
                            if (response.data.results && response.data.results[0]) {
                                const location = response.data.results[0].formatted;  // Use `formatted` for the full address
                                setQuery(location || '');  // Display fetched location in the search bar
                            } else {
                                toast.error("Location data is unavailable");
                            }
                        })
                        .catch((error) => {
                            console.error("Error fetching location", error);
                            toast.error("Error fetching location");
                        });
                },
                (error) => {
                    console.error("Error getting geolocation", error);
                    toast.error("Error getting geolocation");
                }
            );
        } else {
            toast.error("Geolocation is not supported by this browser.");
        }
    };
    

    return (
        <SearchBoxContainer style={styles}>
            <FormTitle style={{ marginBottom: '20px', color: '#000', fontSize: '20px' }}>Travel where you want</FormTitle>
            <form onSubmit={handleSearch}>
                <Input
                    placeholder="Enter hotel name or location"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    required
                />

                <Extras>
                    <InputContainer>
                        <label>Check-In</label>
                        <DatePicker selected={checkIn} onChange={(date) => setCheckIn(date)} />
                    </InputContainer>

                    <InputContainer>
                        <label>Check-Out</label>
                        <DatePicker selected={checkOut} onChange={(date) => setCheckOut(date)} />
                    </InputContainer>

                    <InputContainer>
                        <label>Guests</label>
                        <SelectOccupancy count={count} setCount={setCount} />
                    </InputContainer>

                    <FormButton type="submit" className='small-search-button'>
                        <SearchIcon style={{ fontSize: '22px', marginTop: '2px', marginLeft: "2px" }} />
                    </FormButton>
                    <button type="button" onClick={handleMicClick} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>
                        <MicIcon style={{ fontSize: '22px', marginTop: '2px', marginLeft: "2px" }} />
                    </button>
                    <button type="button" onClick={fetchLocation} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>
                        <LocationOnIcon style={{ fontSize: '22px', marginTop: '2px', marginLeft: "2px" }} />
                    </button>
                </Extras>

                <FormButton type="submit" className='large-search-button'>
                    <SearchIcon style={{ fontSize: '22px', marginTop: '2px', marginLeft: "2px" }} />
                </FormButton>
            </form>
        </SearchBoxContainer>
    );
};

export default SearchBox;