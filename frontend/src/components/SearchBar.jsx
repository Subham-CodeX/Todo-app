import { FaSearch } from "react-icons/fa";

export default function SearchBar({

    value,

    onChange

}) {

    return (

        <div className="notes-search">

            <FaSearch />

            <input

                placeholder="Search notes..."

                value={value}

                onChange={e =>

                    onChange(e.target.value)

                }

            />

        </div>

    );

}