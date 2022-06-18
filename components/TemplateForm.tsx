import React, { FC, useEffect, useState } from "react";
import { useSigningClient } from "contexts/cosmwasm";
import { useRouter } from "next/router";

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_TIERLIST_ADDRESS || "";

const TemplateForm: FC<{
  onCreate: Function | undefined;
  templateId: number | undefined;
}> = ({ onCreate, templateId }) => {
  const router = useRouter();
  const { walletAddress, signingClient } = useSigningClient();
  const [title, setTitle] = useState("");
  const [itemName, setItemName] = useState("");
  const [itemImage, setItemImage] = useState("");
  const [items, setItems] = useState<
    { name: string; image_url: string | null }[]
  >([]);

  useEffect(() => {
    const main = async () => {
      if (templateId) {
        const templateDetails = await signingClient?.queryContractSmart(
          CONTRACT_ADDRESS,
          { template: { id: templateId } }
        );
        setTitle(templateDetails?.template?.title);
        console.log(templateDetails?.template?.items);
        setItems(templateDetails?.template?.items || []);
        // setItems(templateDetails?.template?.items);
      }
    };
    main();
  }, [signingClient, templateId, setTitle, setItems]);

  const addItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (itemName === "") {
      return;
    }
    const item = {
      name: itemName,
      image_url: itemImage === "" ? null : itemImage,
    };
    console.log(item);
    const newItems = [...items, item];
    setItems(newItems);
    setItemName("");
    setItemImage("");
  };

  const clearItems = (e: React.MouseEvent) => {
    e.preventDefault();
    setItems([]);
  };

  const removeItem = (e: React.MouseEvent, itemName: string) => {
    e.preventDefault();
    const newItems = items.filter((item) => item.name !== itemName);
    setItems(newItems);
  };

  const createTemplate = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (items.length === 0 || title.length === 0 || !signingClient) {
      return;
    }

    const msg = {
      create_template: {
        title,
        items,
      },
    };
    try {
      await signingClient.execute(walletAddress, CONTRACT_ADDRESS, msg, "auto");
      setTitle("");
      setItemName("");
      setItemImage("");
      setItems([]);
      if (onCreate) {
        onCreate();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const editTemplate = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (
      items.length === 0 ||
      title.length === 0 ||
      !signingClient ||
      !templateId
    ) {
      return;
    }

    const msg = {
      edit_template: {
        id: templateId,
        title,
        items,
      },
    };
    try {
      await signingClient.execute(walletAddress, CONTRACT_ADDRESS, msg, "auto");
      setTitle("");
      setItemName("");
      setItemImage("");
      setItems([]);
      router.push("/");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-2">
      <h2 className="text-2xl pb-2">
        {templateId ? "Edit Template" : "New Template"}
      </h2>
      <div>
        <div className="pb-2">
          <label>
            <p>Template Title</p>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              type="text"
              className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              placeholder="Template Title e.g. Favourite Foods"
            />
          </label>
        </div>
        <div>
          <h3 className="text-xl pb-2">Add Item</h3>
          <form onSubmit={addItem}>
            <div className="pb-2">
              <label>
                <p>Item Name</p>
                <input
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  type="text"
                  className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                  placeholder="Item Name e.g. Hamburger"
                />
              </label>
            </div>
            <div className="pb-2">
              <label>
                <p>Item Image URL (optional)</p>
                <input
                  value={itemImage}
                  onChange={(e) => setItemImage(e.target.value)}
                  type="text"
                  className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                  placeholder="Image URL"
                />
              </label>
            </div>
            <button className="border border-indigo-500 bg-indigo-500 text-white rounded-md px-4 py-2 transition duration-500 ease select-none hover:bg-indigo-600 focus:outline-none focus:shadow-outline">
              Add Item
            </button>
          </form>
        </div>
        <div>
          <h3 className="text-xl pb-2">Current Items</h3>
          <ul>
            {items.map((item) => {
              return (
                <li
                  className="pb-2"
                  key={item.name}
                  onClick={(e) => removeItem(e, item.name)}
                  style={{ cursor: "pointer" }}
                >
                  {item.name}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
      <div className="flex justify-between">
        <button
          onClick={templateId ? editTemplate : createTemplate}
          className="border border-indigo-500 bg-indigo-500 text-white rounded-md px-4 py-2 transition duration-500 ease select-none hover:bg-indigo-600 focus:outline-none focus:shadow-outline"
        >
          {templateId ? "Edit Template" : "Create Template"}
        </button>
        <button
          onClick={clearItems}
          className="border border-yellow-500 bg-yellow-500 text-white rounded-md px-4 py-2 transition duration-500 ease select-none hover:bg-yellow-600 focus:outline-none focus:shadow-outline"
        >
          Clear Items
        </button>
      </div>
    </div>
  );
};

export default TemplateForm;
