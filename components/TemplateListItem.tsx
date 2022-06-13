import Link from "next/link";
import React, { FC, useState } from "react";

const TemplateListItem: FC<{ id: number; template: any }> = (props) => {
  const [showItems, setShowItems] = useState(false);
  const { id, template } = props;
  console.log(template);
  return (
    <div className="border-4 p-2 m-2">
      <Link href={"/tierlist/" + id} passHref>
        <h2 className="text-xl hover:underline" style={{ cursor: "pointer" }}>
          {template.title}
        </h2>
      </Link>
      <div>
        <button
          onClick={(e) => setShowItems(!showItems)}
          className={
            showItems
              ? "border border-yellow-500 bg-yellow-500 text-white rounded-md p-1 transition duration-500 ease select-none hover:bg-yellow-600 focus:outline-none focus:shadow-outline mb-2"
              : "border border-indigo-500 bg-indigo-500 text-white rounded-md p-1 transition duration-500 ease select-none hover:bg-indigo-600 focus:outline-none focus:shadow-outline mb-2"
          }
        >
          {showItems ? "Hide Items" : "Show Items"}
        </button>
        {showItems && (
          <div>
            <ul>
              {template.items.map((item: any) => (
                <li key={item.name}>{item.name}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default TemplateListItem;
