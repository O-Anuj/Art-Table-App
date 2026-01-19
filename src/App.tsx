import { useEffect, useRef, useState } from 'react';
import { DataTable, type DataTablePageEvent } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { OverlayPanel } from 'primereact/overlaypanel';
import { InputNumber } from 'primereact/inputnumber';
import { Button } from 'primereact/button';
import type { Artwork } from './types/artwork';

const PAGE_SIZE = 12;

function App() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);

  // 🔑 Persistent selection store
  const selectedIdsRef = useRef<Set<number>>(new Set());
  const [selection, setSelection] = useState<Artwork[]>([]);

  const overlayRef = useRef<OverlayPanel>(null);
  const [customCount, setCustomCount] = useState<number>(0);

  useEffect(() => {
    fetchArtworks(page + 1);
  }, [page]);

  const fetchArtworks = async (pageNumber: number) => {
    setLoading(true);
    const res = await fetch(
      `https://api.artic.edu/api/v1/artworks?page=${pageNumber}&limit=${PAGE_SIZE}`
    );
    const json = await res.json();

    setArtworks(json.data);
    setTotalRecords(json.pagination.total);

    // Restore selection for current page
    const restored = json.data.filter((item: Artwork) =>
      selectedIdsRef.current.has(item.id)
    );
    setSelection(restored);

    setLoading(false);
  };

  const onSelectionChange = (e: any) => {
    const currentPageIds = artworks.map(a => a.id);

    // Remove deselected rows from current page
    currentPageIds.forEach(id => {
      if (!e.value.some((a: Artwork) => a.id === id)) {
        selectedIdsRef.current.delete(id);
      }
    });

    // Add selected rows
    e.value.forEach((a: Artwork) =>
      selectedIdsRef.current.add(a.id)
    );

    setSelection(e.value);
  };

  const onPageChange = (e: DataTablePageEvent) => {
    setPage(e.page ?? 0);
  };

  const selectCustomRows = () => {
    const rowsToSelect = artworks.slice(0, customCount);
    rowsToSelect.forEach(a => selectedIdsRef.current.add(a.id));
    setSelection(rowsToSelect);
    overlayRef.current?.hide();
  };

  return (
    <div className="p-4">
      <div className="flex justify-content-between mb-2">
        <h2>Artwork Gallery</h2>
        <Button
          label="Custom Select"
          icon="pi pi-sliders-h"
          onClick={(e) => overlayRef.current?.toggle(e)}
        />
      </div>

      <DataTable
        value={artworks}
        loading={loading}
        paginator
        rows={PAGE_SIZE}
        totalRecords={totalRecords}
        lazy
        first={page * PAGE_SIZE}
        onPage={onPageChange}
        dataKey="id"
        selection={selection}
        onSelectionChange={onSelectionChange}
        selectionMode="checkbox"
      >
        <Column selectionMode="multiple" headerStyle={{ width: '3rem' }} />
        <Column field="title" header="Title" />
        <Column field="place_of_origin" header="Place of Origin" />
        <Column field="artist_display" header="Artist" />
        <Column field="inscriptions" header="Inscriptions" />
        <Column field="date_start" header="Start Date" />
        <Column field="date_end" header="End Date" />
      </DataTable>

      {/* Overlay Panel */}
      <OverlayPanel ref={overlayRef}>
        <div className="flex flex-column gap-2">
          <label>Select N rows (current page)</label>
          <InputNumber
            value={customCount}
            onValueChange={(e) => setCustomCount(e.value ?? 0)}
            min={0}
            max={artworks.length}
          />
          <Button label="Submit" onClick={selectCustomRows} />
        </div>
      </OverlayPanel>
    </div>
  );
}

export default App;
